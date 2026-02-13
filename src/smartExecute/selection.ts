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

export function smartSelect(editor: vscode.TextEditor): string {
    let selection = '';
    if (editor.selection.isEmpty) {
        const line = editor.document.lineAt(editor.selection.active.line);
        if (getConfigSmartExecute()) {
            const endLine = findEndLineOfPythonCodeBlock(line, editor.document);
            const startLine = findStartLineOfPythonCodeBlock(line, editor.document);
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
 * Find the end of a multi-line statement within given boundaries
 * @param currentLine The line where cursor is positioned
 * @param document The text document
 * @param startLine The start line of the search boundary
 * @param endLine The end line of the search boundary
 * @returns The line where the multi-line statement ends, or undefined if not found
 */
export function findMultiLineStatement(
    currentLine: vscode.TextLine,
    document: vscode.TextDocument,
    startLine: vscode.TextLine,
    endLine: vscode.TextLine
): vscode.TextLine | undefined {
    let balance = 0;
    let foundStart = false;
    let resultLine: vscode.TextLine | undefined = undefined;

    // Traverse from startLine to endLine to find the matching closing delimiter
    for (let lineNumber = startLine.lineNumber; lineNumber <= endLine.lineNumber; lineNumber++) {
        const line = document.lineAt(lineNumber);
        const lineText = line.text;
        
        // Remove strings and comments to avoid false positives
        const lineWithoutStringsOrComments = lineText
            .replace(/#.*/g, '')
            .replace(/".*?"/g, '')
            .replace(/'.*?'/g, '');
        
        // Count opening brackets
        const openBrackets = (lineWithoutStringsOrComments.match(/[([{]/g) || []).length;
        
        // Count closing brackets
        const closeBrackets = (lineWithoutStringsOrComments.match(/[)]]}]/g) || []).length;
        
        // Update balance
        balance += openBrackets - closeBrackets;
        
        // If we find the start of a multi-line statement
        if (openBrackets > closeBrackets) {
            foundStart = true;
        }
        
        // If we've found the start and balance returns to 0, we've found the end
        if (foundStart && balance === 0) {
            resultLine = line;
            break;
        }
    }
    
    return resultLine;
}
