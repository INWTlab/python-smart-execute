import * as vscode from 'vscode';
import {
    isClosingParanthesis,
    isDecorator,
    isElse,
    isElif,
    isExcept,
    isFinally,
    isNotLastLine,
    levelOfIndentation,
    lineIsCode,
} from './helpers';
import { getConfigSmartExecute } from './config';

/**
 * Checks if a selection is empty, with fallback for environments where isEmpty is undefined
 * @param selection The selection to check
 * @returns true if the selection is empty
 */
export function isSelectionEmpty(selection: vscode.Selection): boolean {
    return selection.isEmpty !== undefined ? selection.isEmpty : 
           (selection.start.line === selection.end.line && 
            selection.start.character === selection.end.character);
}

export function smartSelect(editor: vscode.TextEditor): string {
    let selection = '';
    if (isSelectionEmpty(editor.selection)) {
        const line = editor.document.lineAt(editor.selection.active.line);
        if (getConfigSmartExecute()) {
            const multilineRange = getMultilineStatementRange(line, editor.document);
            const targetLine = multilineRange ? multilineRange.startLine : line;
            
            const startLine = findStartLineOfPythonCodeBlock(targetLine, editor.document);
            let endLine = findEndLineOfPythonCodeBlock(targetLine, editor.document);
            
            if (multilineRange && endLine.lineNumber < multilineRange.endLine.lineNumber) {
                endLine = multilineRange.endLine;
            }
            
            editor.selection = newSelectionForBlock(startLine, endLine);
        } else {
            editor.selection = newSelectionForLine(line);
        }
    }
    selection = editor.document.getText(new vscode.Range(editor.selection.start, editor.selection.end));
    return selection;
}

export function stepCursor(editor: vscode.TextEditor): void {
    const line = editor.document.lineAt(editor.selection.active.line);
    const nextLine = findNextCodeLine(line, editor.document);
    editor.selection = newSelectionForCursor(nextLine);
    editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.start));
}

export function findNextCodeLine(line: vscode.TextLine, document: vscode.TextDocument): vscode.TextLine {
    while (isNotLastLine(line.lineNumber, document.lineCount)) {
        line = document.lineAt(line.lineNumber + 1);
        if (lineIsCode(line) && !isDecorator(line.text)) {
            break;
        }
    }
    return line;
}

export function findStartLineOfPythonCodeBlock(line: vscode.TextLine, document: vscode.TextDocument) {
    let finalLine = line;
    while (line.lineNumber - 1 >= 0) {
        line = document.lineAt(line.lineNumber - 1);
        if (isDecorator(line.text)) {
            finalLine = line;
        } else {
            break;
        }
    }
    return finalLine;
}

export function findEndLineOfPythonCodeBlock(line: vscode.TextLine, document: vscode.TextDocument) {
    const rootIndentation = levelOfIndentation(line.text);
    let finalLine = line;
    while (isNotLastLine(line.lineNumber + 1, document.lineCount)) {
        line = document.lineAt(line.lineNumber + 1);
        if (lineIsCode(line)) {
            const currentIndentation = levelOfIndentation(line.text);
            
            if (currentIndentation < rootIndentation) {
                break;
            }
            
            if (currentIndentation === rootIndentation) {
                const isPartOfBlock = isExcept(line.text) ||
                                      isFinally(line.text) ||
                                      isElif(line.text) ||
                                      isElse(line.text) ||
                                      isClosingParanthesis(line.text);
                if (!isPartOfBlock) {
                    break;
                }
            }
            
            finalLine = line;
        }
    }
    return finalLine;
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

export { isDecorator, isNotLastLine, lineIsCode };

/**
 * Remove strings and comments from a line of text
 * @param lineText The text to process
 * @returns Text with strings and comments removed
 */
function removeStringsAndComments(lineText: string): string {
    let result = lineText.replace(/#.*/g, '');
    result = result.replace(/"[^"]*"/g, '');
    result = result.replace(/'[^']*'/g, '');
    return result;
}

/**
 * Find the start and end lines of a multiline statement that the current line is part of.
 * @param currentLine The line where cursor is positioned
 * @param document The text document
 * @returns The start and end lines of the multiline statement, or undefined if not found
 */
export function getMultilineStatementRange(
    currentLine: vscode.TextLine,
    document: vscode.TextDocument
): { startLine: vscode.TextLine; endLine: vscode.TextLine } | undefined {
    const balances: number[] = [];
    let currentBalance = 0;

    for (let i = 0; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;
        const cleanText = removeStringsAndComments(lineText);
        
        const openBrackets = (cleanText.match(/[([{]/g) || []).length;
        const closeBrackets = (cleanText.match(/[)}\]]/g) || []).length;
        
        currentBalance += openBrackets - closeBrackets;
        if (currentBalance < 0) {
            currentBalance = 0;
        }
        balances.push(currentBalance);
    }

    const L = currentLine.lineNumber;
    const prevBalance = L > 0 ? balances[L - 1] : 0;
    const currBalance = balances[L];

    if (prevBalance > 0 || currBalance > 0) {
        let startLineNum = L;
        while (startLineNum > 0 && balances[startLineNum - 1] > 0) {
            startLineNum--;
        }

        let endLineNum = L;
        while (endLineNum < document.lineCount - 1 && balances[endLineNum] > 0) {
            endLineNum++;
        }

        return {
            startLine: document.lineAt(startLineNum),
            endLine: document.lineAt(endLineNum)
        };
    }

    return undefined;
}
