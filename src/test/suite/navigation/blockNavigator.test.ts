import * as assert from 'assert';
import * as vscode from 'vscode';
import { getTargetPosition, jumpNextBlock, jumpPreviousBlock } from '../../../navigation/blockNavigator';
import { MockTextDocument } from '../mocks';
import { DocumentState, expectCursorPosition } from './testHelpers';

suite('Block Navigator Test Suite', () => {
    test('Exports should exist', () => {
        // This is just a basic test to ensure our functions are properly exported
        assert.ok(typeof getTargetPosition === 'function', 'getTargetPosition should be a function');
        assert.ok(typeof jumpNextBlock === 'function', 'jumpNextBlock should be a function');
        assert.ok(typeof jumpPreviousBlock === 'function', 'jumpPreviousBlock should be a function');
    });

    test('Basic navigation functions', () => {
        // Create a mock document for testing
        const content = `def function1():
    pass

def function2():
    pass
    
class TestClass:
    def method1(self):
        pass
        
if condition:
    do_something()`;
        const doc = new MockTextDocument(content);
        const position = new vscode.Position(0, 0);

        // Test that our functions can be called without error
        const nextPos = jumpNextBlock(doc, position);
        const prevPos = jumpPreviousBlock(doc, position);

        // Basic existence checks
        assert.ok(nextPos instanceof vscode.Position, 'Should return a Position object');
        assert.ok(prevPos instanceof vscode.Position, 'Should return a Position object');
    });

    test('should have symmetric fallback at document end', () => {
        const state = new DocumentState('def function1():\n    pass\n\ndef function2():\n    pass', 3, 0);
        expectCursorPosition(state, 'next', 'last-line');
    });

    test('should have symmetric fallback at document start', () => {
        const state = new DocumentState('def function1():\n    pass\n\ndef function2():\n    pass', 0, 0);
        expectCursorPosition(state, 'previous', 'first-line');
    });

    test('should navigate to same-level next block using indentation', () => {
        const state = new DocumentState('def outer():\n    def inner1():\n        def deeply_nested():\n            pass\n    \n    def inner2():\n        pass\n\ndef another_function():\n    pass', 1, 0);
        expectCursorPosition(state, 'next', 5);
    });

    test('should navigate to same-level previous block using indentation', () => {
        const state = new DocumentState('def outer():\n    def inner1():\n        def deep():\n            pass\n    \n    def inner2():\n        pass', 5, 0);
        expectCursorPosition(state, 'previous', 1);
    });

    test('should handle decorated functions correctly', () => {
        const state = new DocumentState('@decorator\ndef decorated_func():\n    pass\n\ndef normal_func():\n    pass', 0, 0);
        expectCursorPosition(state, 'next', 4);
    });

    test('should handle multi-line statements correctly', () => {
        const state = new DocumentState('def func1():\n    data = {\n        \'key\': \'value\'\n    }\n    pass\n\ndef func2():\n    pass', 0, 0);
        expectCursorPosition(state, 'next', 6);
    });
});
