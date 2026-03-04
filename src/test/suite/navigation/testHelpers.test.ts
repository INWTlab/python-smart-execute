import * as assert from 'assert';
import { suite, test } from 'mocha';
import { DocumentState, expectCursorPosition } from './testHelpers';

suite('Navigation Test Helpers Test Suite', () => {
    test('should export DocumentState from smartExecute', () => {
        const state = new DocumentState('x', 0, 0);
        assert.strictEqual(state.content, 'x');
        assert.strictEqual(state.cursorLine, 0);
        assert.strictEqual(state.cursorChar, 0);
    });

    test('should assert numeric expectedLine for next direction', () => {
        const state = new DocumentState('def foo():\n    pass\n\ndef bar():\n    pass', 0, 0);
        expectCursorPosition(state, 'next', 3);
    });

    test('should assert numeric expectedLine for previous direction', () => {
        const state = new DocumentState('def foo():\n    pass\n\ndef bar():\n    pass', 3, 0);
        expectCursorPosition(state, 'previous', 0);
    });

    test("should resolve 'first-line' to line 0", () => {
        const state = new DocumentState('def foo():\n    pass\n\ndef bar():\n    pass', 0, 0);
        expectCursorPosition(state, 'previous', 'first-line');
    });

    test("should resolve 'last-line' to lineCount - 1", () => {
        const state = new DocumentState('def foo():\n    pass\n\ndef bar():\n    pass', 3, 0);
        expectCursorPosition(state, 'next', 'last-line');
    });

    test("should handle 'first-line' and 'last-line' in single-line document", () => {
        const state = new DocumentState('x = 1', 0, 0);
        expectCursorPosition(state, 'next', 'last-line');
        expectCursorPosition(state, 'previous', 'first-line');
    });

    test('should assert character position when provided', () => {
        const state = new DocumentState('def foo():\n    pass\n\ndef bar():\n    pass', 0, 0);
        expectCursorPosition(state, 'next', 3, { character: 0 });
    });

    test('should default character to 0 when not provided', () => {
        const state = new DocumentState('def foo():\n    pass\n\ndef bar():\n    pass', 0, 0);
        expectCursorPosition(state, 'next', 3);
    });

    test('should throw on assertion failure', () => {
        const state = new DocumentState('def foo():\n    pass\n\ndef bar():\n    pass', 0, 0);
        assert.throws(() => expectCursorPosition(state, 'next', 99));
    });
});
