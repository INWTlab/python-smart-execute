import * as vscode from 'vscode';
import { indentationAsString, levelOfIndentation } from './helpers';

export async function selectionToRepl(selection: string): Promise<void> {
    const sanitizedSelection = sanitizeSelection(selection);
    await vscode.commands.executeCommand('python.startREPL');
    if (vscode.window) {
        const terminal = vscode.window.activeTerminal;
        terminal?.sendText(sanitizedSelection, true);
    }
}

export function sanitizeSelection(code: string): string {
    const rootIndentation = levelOfIndentation(code);
    let codeLines = code.split('\n');
    const rootIndentationRegExp = RegExp(
        '^\\s{indentation-level}'.replace('indentation-level', rootIndentation.toString()),
    );
    codeLines = codeLines.map((line) => {
        return line.replace(rootIndentationRegExp, '');
    });
    for (let i = 0; i < codeLines.length; i++) {
        if (codeLines[i] === '') {
            let j = 1;
            while (i + j < codeLines.length) {
                if (/^.+$/.test(codeLines[i + j])) {
                    codeLines[i] = indentationAsString(codeLines[i + j]);
                    break;
                }
                j++;
            }
        }
    }
    code = codeLines.join('\n');
    if (levelOfIndentation(codeLines[codeLines.length - 1]) > 0) {
        code = code.concat('\n\n');
    }
    return code;
}
