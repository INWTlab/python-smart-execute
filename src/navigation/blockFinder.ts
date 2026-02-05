import * as vscode from 'vscode';
import { skipMultiLineStatement } from './multiLineStatement';

/**
 * Get the level of indentation for a line (in spaces)
 * @param lineText The text of the line
 * @returns The indentation level (number of spaces)
 */
export function levelOfIndentation(lineText: string): number {
    const leadingWhitespace = lineText.search(/\S/);
    return leadingWhitespace === -1 ? 0 : leadingWhitespace;
}

/**
 * Check if a line is a block header (function, class, if, for, while, etc.)
 * @param line The line to check
 * @param document The document containing the line
 * @returns boolean indicating if the line is a block header
 */
export function isBlockHeader(line: vscode.TextLine, _document: vscode.TextDocument): boolean {
    // Regular expressions for different block-starting constructs
    const blockStarters = [
        /^(\s*)def\s+\w+/,
        /^(\s*)class\s+\w+/,
        /^(\s*)if\s+/,
        /^(\s*)elif\s+/,
        /^(\s*)else\s*:/,
        /^(\s*)for\s+/,
        /^(\s*)while\s+/,
        /^(\s*)try\s*:/,
        /^(\s*)except.*:/,
        /^(\s*)with\s+/,
        /^(\s*)match\s+/,
        /^(\s*)case\s+/,
    ];
    
    // Check if the line matches any block starter pattern
    for (const pattern of blockStarters) {
        if (pattern.test(line.text)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Find the block header from a given line, skipping decorators
 * @param document The document to search in
 * @param line The starting line number
 * @returns The block header line or undefined if not found
 */
export function findBlockHeaderFromLine(document: vscode.TextDocument, line: number): vscode.TextLine | undefined {
    if (line < 0 || line >= document.lineCount) {
        return undefined;
    }
    
    // Skip backwards to find the actual block header
    let currentLine = line;
    while (currentLine >= 0) {
        const lineObj = document.lineAt(currentLine);
        if (isBlockHeader(lineObj, document)) {
            return lineObj;
        }
        currentLine--;
    }
    
    return undefined;
}

/**
 * Get the parent block header for a given line
 * @param document The document to search in
 * @param line The line to start from
 * @returns The parent block header or undefined if not found
 */
export function getParentBlockHeader(document: vscode.TextDocument, startLine: number): vscode.TextLine | undefined {
    if (startLine < 0 || startLine >= document.lineCount) {
        return undefined;
    }
    
    // Get the indentation level of the starting line
    const startLineObj = document.lineAt(startLine);
    const startIndent = levelOfIndentation(startLineObj.text);
    
    // Look for a line with less indentation
    let lineNum = startLine - 1;
    while (lineNum >= 0) {
        const lineObj = document.lineAt(lineNum);
        const lineIndent = levelOfIndentation(lineObj.text);
        
        // If we find a block header with less indentation, that's our parent
        if (isBlockHeader(lineObj, document) && lineIndent < startIndent) {
            return lineObj;
        }
        
        lineNum--;
    }
    
    return undefined;
}

/**
 * Find the next block header in the document
 * @param document The document to search in
 * @param startLine The line to start searching from
 * @returns The next block header or undefined if not found
 */
export function findNextBlockHeader(document: vscode.TextDocument, startLine: number): vscode.TextLine | undefined {
    if (startLine < 0 || startLine >= document.lineCount) {
        return undefined;
    }
    
    // Start searching from the next line
    let lineNum = startLine + 1;
    while (lineNum < document.lineCount) {
        const lineObj = document.lineAt(lineNum);
        if (isBlockHeader(lineObj, document)) {
            return lineObj;
        }
        lineNum++;
    }
    
    return undefined;
}

/**
 * Find the previous block header in the document
 * @param document The document to search in
 * @param startLine The line to start searching from
 * @returns The previous block header or undefined if not found
 */
export function findPreviousBlockHeader(document: vscode.TextDocument, startLine: number): vscode.TextLine | undefined {
    if (startLine < 0 || startLine >= document.lineCount) {
        return undefined;
    }
    
    // Start searching from the previous line
    let lineNum = startLine - 1;
    while (lineNum >= 0) {
        const lineObj = document.lineAt(lineNum);
        if (isBlockHeader(lineObj, document)) {
            return lineObj;
        }
        lineNum--;
    }
    
    return undefined;
}

/**
 * Find the first nested block header from a given line
 * @param document The document to search in
 * @param startLine The line to start searching from
 * @returns The first nested block header or undefined if not found
 */
export function findFirstNestedBlockHeader(document: vscode.TextDocument, startLine: number): vscode.TextLine | undefined {
    if (startLine < 0 || startLine >= document.lineCount) {
        return undefined;
    }
    
    // Skip any multi-line statements that might be present
    const actualStartLine = skipMultiLineStatement(document, startLine);
    
    // Get the starting line's indentation level
    const startLineObj = document.lineAt(actualStartLine);
    const startIndent = levelOfIndentation(startLineObj.text);
    
    // Look for a block header with greater indentation
    let lineNum = actualStartLine + 1;
    while (lineNum < document.lineCount) {
        const lineObj = document.lineAt(lineNum);
        const lineIndent = levelOfIndentation(lineObj.text);
        
        // If we find a block header with greater indentation, that's our nested block
        if (isBlockHeader(lineObj, document) && lineIndent > startIndent) {
            return lineObj;
        }
        
        lineNum++;
    }
    
    return undefined;
}