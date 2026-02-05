import * as vscode from 'vscode';
import { findNextBlockHeader, findPreviousBlockHeader, findBlockHeaderFromLine } from './blockFinder';
// import { skipMultiLineStatement } from './multiLineStatement'; // Will be used when needed

/**
 * Get the target position for navigation
 * @param document The active document
 * @param currentPosition The current cursor position
 * @param direction The direction of navigation (1 for next, -1 for previous)
 * @returns The target position to navigate to
 */
export function getTargetPosition(document: vscode.TextDocument, currentPosition: vscode.Position, direction: number): vscode.Position {
    // Get the current line
    const currentLine = document.lineAt(currentPosition.line);
    
    // First, find the block header for the current line
    let blockHeader = findBlockHeaderFromLine(document, currentLine.lineNumber);
    
    // If we couldn't find a block header for the current line, 
    // we'll use the current line as a starting point
    if (!blockHeader) {
        blockHeader = currentLine;
    }
    
    // Find the target block header based on direction
    if (direction > 0) {
        // Navigate to next block
        const nextBlock = findNextBlockHeader(document, blockHeader.lineNumber);
        if (nextBlock) {
            return new vscode.Position(nextBlock.lineNumber, 0);
        }
        // If no next block found, stay at current position
        return currentPosition;
    } else {
        // Navigate to previous block
        const previousBlock = findPreviousBlockHeader(document, blockHeader.lineNumber);
        if (previousBlock) {
            return new vscode.Position(previousBlock.lineNumber, 0);
        }
        // If no previous block found, go to beginning of file
        return new vscode.Position(0, 0);
    }
}

/**
 * Jump to the next block in the document
 * @param document The document to navigate in
 * @param currentPosition The current cursor position
 * @returns The position to jump to
 */
export function jumpNextBlock(document: vscode.TextDocument, currentPosition: vscode.Position): vscode.Position {
    return getTargetPosition(document, currentPosition, 1);
}

/**
 * Jump to the previous block in the document
 * @param document The document to navigate in
 * @param currentPosition The current cursor position
 * @returns The position to jump to
 */
export function jumpPreviousBlock(document: vscode.TextDocument, currentPosition: vscode.Position): vscode.Position {
    return getTargetPosition(document, currentPosition, -1);
}