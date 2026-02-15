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
 * Remove strings and comments from a line of text
 * @param lineText The text to process
 * @returns Text with strings and comments removed
 */
function removeStringsAndComments(lineText: string): string {
    // Remove comments
    let result = lineText.replace(/#.*/g, '');
    
    // Remove double-quoted strings (non-greedy)
    result = result.replace(/"[^"]*"/g, '');
    
    // Remove single-quoted strings (non-greedy)
    result = result.replace(/'[^']*'/g, '');
    
    return result;
}

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
    let inMultiLineStatement = false;
    let resultLine: vscode.TextLine | undefined = undefined;

    // First pass: find the opening bracket that starts the multi-line statement
    // We need to go backwards from currentLine to find where the statement started
    for (let lineNumber = startLine.lineNumber; lineNumber <= currentLine.lineNumber; lineNumber++) {
        const line = document.lineAt(lineNumber);
        const lineText = line.text;
        
        // Remove strings and comments to avoid false positives
        const lineWithoutStringsOrComments = removeStringsAndComments(lineText);
        
        // Count opening brackets
        const openBrackets = (lineWithoutStringsOrComments.match(/[([{]/g) || []).length;
        
        // Count closing brackets
        const closeBrackets = (lineWithoutStringsOrComments.match(/[)}\]\]]/g) || []).length;
        
        balance += openBrackets - closeBrackets;
        
        // If we find unbalanced opening brackets, we're in a multi-line statement
        if (balance > 0) {
            inMultiLineStatement = true;
        }
    }

    // Special case: if cursor is already on the closing bracket, return it
    const currentLineText = removeStringsAndComments(currentLine.text);
    const currentCloseBrackets = (currentLineText.match(/[)}\]\]]/g) || []).length;
    if (currentCloseBrackets > 0 && inMultiLineStatement) {
        return currentLine;
    }

    // If we're not in a multi-line statement, return undefined
    if (!inMultiLineStatement || balance <= 0) {
        return undefined;
    }

    // Second pass: find where the statement ends (balance returns to 0)
    for (let lineNumber = currentLine.lineNumber + 1; lineNumber <= endLine.lineNumber; lineNumber++) {
        const line = document.lineAt(lineNumber);
        const lineText = line.text;
        
        // Remove strings and comments to avoid false positives
        const lineWithoutStringsOrComments = removeStringsAndComments(lineText);
        
        // Count opening brackets
        const openBrackets = (lineWithoutStringsOrComments.match(/[([{]/g) || []).length;
        
        // Count closing brackets
        const closeBrackets = (lineWithoutStringsOrComments.match(/[)}\]\]]/g) || []).length;
        
        balance += openBrackets - closeBrackets;
        
        // If balance returns to 0, we've found the end
        if (balance === 0) {
            resultLine = line;
            break;
        }
    }
    
    return resultLine;
}
