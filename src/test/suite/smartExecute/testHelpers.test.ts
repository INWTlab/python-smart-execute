import * as assert from 'assert';
import { DocumentState, expectSelection } from './testHelpers';

suite('Test Helpers Facility', () => {
    test('DocumentState.createEditor creates editor with correct document', () => {
        const content = 'line1\nline2\nline3';
        const state = new DocumentState(content, 0, 0);
        const editor = state.createEditor();
        
        assert.strictEqual(editor.document.getText(), content);
        assert.strictEqual(editor.document.lineCount, 3);
    });

    test('DocumentState.createEditor sets cursor position correctly', () => {
        const content = 'line1\nline2\nline3';
        const state = new DocumentState(content, 2, 5);
        const editor = state.createEditor();
        
        assert.strictEqual(editor.selection.start.line, 2);
        assert.strictEqual(editor.selection.start.character, 5);
        assert.strictEqual(editor.selection.end.line, 2);
        assert.strictEqual(editor.selection.end.character, 5);
    });

    test('expectSelection derives expected text correctly (multi-line)', () => {
        const content = '@timer\ndef some_function(x):\n    return x\n';
        const state = new DocumentState(content, 1, 0);
        expectSelection(state, 0, 2);
    });

    test('expectSelection derives expected text correctly (single line)', () => {
        const content = 'x = 1\ny = 2';
        const state = new DocumentState(content, 0, 0);
        expectSelection(state, 0, 0);
    });

    test('expectSelection with smartExecute=false', () => {
        const content = '@timer\ndef some_function(x):\n    return x\n';
        const state = new DocumentState(content, 1, 0);
        expectSelection(state, 1, 1, {smartExecute: false});
    });
});
