// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("python-smart-execute.smartExecAndStep", async () => {
            let engine = getConfigEngine();
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let selection = smartSelect();
                await delay();
                if (engine === "python") {
                    selectionToRepl(selection);
                } else if (engine === "jupyter") {
                    vscode.commands.executeCommand("jupyter.execSelectionInteractive", selection);
                }
                step(editor);
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("python-smart-execute.debugExecAndStep", async () => {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                smartSelect();
                await delay();
                vscode.commands.executeCommand("editor.debug.action.selectionToRepl");
                step(editor);
            }
        }),
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}

async function selectionToRepl(selection: string) {
    selection = sanitizeSelection(selection);
    await vscode.commands.executeCommand("python.startREPL");
    if (vscode.window) {
        let terminal = vscode.window.activeTerminal;
        terminal?.sendText(selection, true);
    }
}

function sanitizeSelection(code: string) {
    let rootIndentation = levelOfIndentation(code);
    let codeLines = code.split("\n");
    // trim indentation:
    let rootIndentationRegExp = RegExp(
        "^\\s{indentation-level}".replace("indentation-level", rootIndentation.toString()),
    );
    codeLines = codeLines.map((line) => {
        return line.replace(rootIndentationRegExp, "");
    });
    // fill empty lines with correct indentation
    for (let i = 0; i < codeLines.length; i++) {
        if (codeLines[i] === "") {
            let j = 1;
            while (i + j < codeLines.length) {
                // the next non empty line will decide the indentation level
                if (/^.+$/.test(codeLines[i + j])) {
                    codeLines[i] = indentationAsString(codeLines[i + j]);
                    break;
                }
                j++;
            }
        }
    }
    // glue back together
    code = codeLines.join("\n");
    // properly exit code block
    if (levelOfIndentation(codeLines[codeLines.length - 1]) > 0) {
        code = code.concat("\n\n");
    }
    return code;
}

function step(editor: vscode.TextEditor) {
    if (editor && getConfigStep()) {
        let line = editor.document.lineAt(editor.selection.active.line);
        while (isNotLastLine(line.lineNumber, editor.document.lineCount)) {
            line = editor.document.lineAt(line.lineNumber + 1);
            if (lineIsCode(line) && !isDecorator(line.text)) {
                break;
            }
        }
        editor.selection = newSelectionForCursor(line);
        editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.start));
    }
}

function smartSelect() {
    let editor = vscode.window.activeTextEditor;
    let selection = "";
    if (editor) {
        if (editor.selection.isEmpty) {
            // We respect the selection of the user and leave it to
            // juypyter extension to handle all edge cases.
            // When the selection is empty, we expand the selection to the
            // next 'best' thing:
            //   1. When we are in the defining line of a block (class,
            //      function, loop, control structure): select the entire
            //      block
            //   2. When we are not in case 1 or 2, select the current line
            let line = editor.document.lineAt(editor.selection.active.line);
            if (getConfigSmartExecute()) {
                // select the code block
                let endLine = findEndLineOfPythonCodeBlock(line, editor.document);
                let startLine = findStartLineOfPythonCodeBlock(line, editor.document);
                editor.selection = newSelectionForBlock(startLine, endLine);
            } else {
                // otherwise use current line
                editor.selection = newSelectionForLine(line);
            }
        }
        selection = editor.document.getText(
            new vscode.Range(editor.selection.start, editor.selection.end),
        );
    }
    return selection;
}

function getConfigSmartExecute(): boolean {
    return vscode.workspace.getConfiguration("inwtlab.Python.Smart.Execute").smartExecute
        .blockSelect;
}

function getConfigEngine(): string {
    return vscode.workspace.getConfiguration("inwtlab.Python.Smart.Execute").smartExecute.engine;
}

function getConfigStep(): boolean {
    return vscode.workspace.getConfiguration("inwtlab.Python.Smart.Execute").smartExecute.step;
}

function getConfigDelay(): number {
    return vscode.workspace.getConfiguration("inwtlab.Python.Smart.Execute").smartExecute.delay;
}

function findStartLineOfPythonCodeBlock(line: vscode.TextLine, document: vscode.TextDocument) {
    // we check if there are any decorators before the current line. If so,
    // we find the most top level and return that as starting line
    let finalLine = line;
    while (line.lineNumber - 1 >= 0) {
        line = document.lineAt(line.lineNumber - 1);
        if (isDecorator(line.text)) {
            // is it a decorator?
            finalLine = line;
        } else {
            // if not we just stop here
            break;
        }
    }
    return finalLine;
}

function findEndLineOfPythonCodeBlock(line: vscode.TextLine, document: vscode.TextDocument) {
    let rootIndentation = levelOfIndentation(line.text);
    let finalLine = line;
    while (isNotLastLine(line.lineNumber + 1, document.lineCount)) {
        line = document.lineAt(line.lineNumber + 1);
        if (lineIsCode(line)) {
            if (
                levelOfIndentation(line.text) <= rootIndentation &&
                !isExcept(line.text) &&
                !isFinally(line.text) &&
                !isElif(line.text) &&
                !isElse(line.text) &&
                !isClosingParanthesis(line.text)
            ) {
                break;
            } else {
                finalLine = line;
            }
        }
    }
    return finalLine;
}

function isClosingParanthesis(text: string) {
    return /^\s*[\)\]\}]+/.test(text);
}

function isDecorator(text: string) {
    return /^\s*@/.test(text);
}

function isExcept(text: string) {
    return /^\s*except[\s:]/.test(text);
}

function isFinally(text: string) {
    return /^\s*finally:/.test(text);
}

function isElif(text: string) {
    return /^\s*elif\s/.test(text);
}

function isElse(text: string) {
    return /^\s*else:/.test(text);
}

function levelOfIndentation(line: string) {
    let regexpMatch = line.match(/^\s*/);
    if (regexpMatch === null) {
        return 0;
    } else {
        return regexpMatch[0].length;
    }
}

function indentationAsString(line: string) {
    let regexpMatch = line.match(/^\s*/);
    if (regexpMatch === null) {
        return "";
    } else {
        return regexpMatch[0];
    }
}

function newSelectionForBlock(line: vscode.TextLine, endLine: vscode.TextLine) {
    return new vscode.Selection(
        line.lineNumber,
        line.range.start.character,
        endLine.lineNumber,
        endLine.range.end.character,
    );
}

function newSelectionForCursor(line: vscode.TextLine) {
    return new vscode.Selection(
        line.lineNumber,
        line.range.start.character,
        line.lineNumber,
        line.range.start.character,
    );
}

function newSelectionForLine(line: vscode.TextLine) {
    return new vscode.Selection(
        line.lineNumber,
        line.range.start.character,
        line.lineNumber,
        line.range.end.character,
    );
}

function isNotLastLine(currentLine: number, lineCount: number) {
    return currentLine < lineCount - 1;
}

function lineIsCode(line: vscode.TextLine | undefined) {
    // A line is empty when its empty, contains only whitespaces or a comment
    let lineText = line?.text || "";
    return !(line?.isEmptyOrWhitespace || /^\s*#/.test(lineText));
}

function delay() {
    let ms: number = getConfigDelay();
    return new Promise((resolve) => setTimeout(resolve, ms));
}
