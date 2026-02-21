import * as vscode from 'vscode';
import { indentationAsString, levelOfIndentation } from './helpers';

export async function selectionToRepl(selection: string): Promise<void> {
    const sanitizedSelection = sanitizeSelection(selection);
    try {
        await vscode.commands.executeCommand('python.startREPL');
    } catch (error) {
        console.warn('ms-python startREPL failed (likely due to missing workspace), using fallback terminal.', error);

        // Failsafe for test environment without a workspace folder
        if (vscode.window) {
            let terminal = vscode.window.activeTerminal;
            if (!terminal || !terminal.name.toLowerCase().includes('python')) {
                terminal = vscode.window.createTerminal('Python (Fallback)');
                terminal.show(true);
                // Start a standard python REPL manually
                terminal.sendText('python3', true);

                // Brief pause to allow Python REPL to spin up before sending code
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }
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
