import * as assert from 'assert';
import * as vscode from 'vscode';
import { MockTextDocument } from '../mocks';
import { jumpNextBlock, jumpPreviousBlock } from '../../../navigation/blockNavigator';

export { DocumentState } from '../smartExecute/testHelpers';

export interface ExpectCursorPositionOptions {
    character?: number;
}

export function expectCursorPosition(
    state: { content: string; cursorLine: number; cursorChar: number },
    direction: 'next' | 'previous',
    expectedLine: number | 'first-line' | 'last-line',
    options?: ExpectCursorPositionOptions
): void {
    const doc = new MockTextDocument(state.content);
    const position = new vscode.Position(state.cursorLine, state.cursorChar);

    let resolvedLine: number;
    if (expectedLine === 'first-line') {
        resolvedLine = 0;
    } else if (expectedLine === 'last-line') {
        resolvedLine = doc.lineCount - 1;
    } else {
        resolvedLine = expectedLine;
    }

    const result = direction === 'next'
        ? jumpNextBlock(doc, position)
        : jumpPreviousBlock(doc, position);

    assert.strictEqual(result.line, resolvedLine);
    assert.strictEqual(result.character, options?.character ?? 0);
}
