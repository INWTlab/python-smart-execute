import * as assert from 'assert';
import * as vscode from 'vscode';
import { smartSelect } from '../../../smartExecute/selection';
import { MockTextDocument, MockTextEditor } from '../mocks';
import { getConfigSmartExecute } from '../../../smartExecute/config';
import { DocumentState, expectSelection } from './testHelpers';

suite('SmartSelect Behavior Test Suite', () => {
    test('Single line selection when smart selection is disabled', () => {
        const state = new DocumentState('x = 1', 0, 0);
        expectSelection(state, 0, 0, {smartExecute: false});
    });

    test('Function selection with decorators', () => {
        const state = new DocumentState('@timer\ndef some_function(x):\n    return x\n', 1, 0);
        expectSelection(state, 0, 2);
    });

    test('Class selection with decorators', () => {
        const state = new DocumentState('@dataclass\nclass Person:\n    name: str\n    age: int\n', 1, 0);
        expectSelection(state, 0, 3);
    });

    test('Control flow selection (if/elif/else)', () => {
        const state = new DocumentState('if x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")\n', 0, 0);
        expectSelection(state, 0, 5);
    });

    test('Multi-line statement selection (dictionary)', () => {
        const state = new DocumentState('data = {\n    "key1": "value1",\n    "key2": "value2",\n    "key3": "value3"\n}\n', 0, 0);
        expectSelection(state, 0, 4);
    });

    test('Multi-block document selection (target specific function)', () => {
        const state = new DocumentState('def first_function():\n    pass\n\n@timer\ndef target_function(x):\n    return x\n\ndef last_function():\n    pass\n', 4, 0);
        expectSelection(state, 3, 5);
    });

    test('Edge case: empty lines and comments', () => {
        const state = new DocumentState('def first_function():\n    pass\n\n# This is a comment\n\n@timer\ndef target_function(x):\n    return x\n\n# Another comment\n\ndef last_function():\n    pass\n', 6, 0);
        expectSelection(state, 5, 7);
    });

    suite('Multiline Statement Selection Tests', () => {
        let originalGetConfig: () => boolean;

        setup(() => {
            originalGetConfig = getConfigSmartExecute;
            (getConfigSmartExecute as unknown as () => boolean) = () => true;
        });

        teardown(() => {
            (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
        });

        test('Single Line Execution Between Multiline Statements', () => {
            const content = 'x = (\n    1 + 2\n)\ny = 3\nz = [\n    4, 5\n]';
            const doc = new MockTextDocument(content);
            const editor = new MockTextEditor(doc);
            editor.selection = new vscode.Selection(3, 0, 3, 0); // Cursor on y = 3
            
            const selectedText = smartSelect(editor);
            
            assert.strictEqual(editor.selection.start.line, 3);
            assert.strictEqual(editor.selection.end.line, 3);
            assert.strictEqual(selectedText, 'y = 3');
        });

        test('Multiline Statement Surrounded by Blocks and Other Code', () => {
            const content = 'def my_func():\n    pass\n\nmy_list = [\n    1,\n    2,\n    3\n]\n\nclass MyClass:\n    pass';
            const expectedSelection = 'my_list = [\n    1,\n    2,\n    3\n]';
            const doc = new MockTextDocument(content);
            const editor = new MockTextEditor(doc);
            editor.selection = new vscode.Selection(5, 0, 5, 0); // Cursor on 2,
            
            const selectedText = smartSelect(editor);
            
            assert.strictEqual(editor.selection.start.line, 3);
            assert.strictEqual(editor.selection.end.line, 7);
            assert.strictEqual(selectedText, expectedSelection);
        });

        test('Nested Multiline Statements', () => {
            const content = 'result = my_function(\n    [\n        1, 2,\n        3\n    ],\n    {"key": "value"}\n)';
            const expectedSelection = 'result = my_function(\n    [\n        1, 2,\n        3\n    ],\n    {"key": "value"}\n)';
            const doc = new MockTextDocument(content);
            const editor = new MockTextEditor(doc);
            editor.selection = new vscode.Selection(2, 0, 2, 0); // Cursor on 1, 2,
            
            const selectedText = smartSelect(editor);
            
            assert.strictEqual(editor.selection.start.line, 0);
            assert.strictEqual(editor.selection.end.line, 6);
            assert.strictEqual(selectedText, expectedSelection);
        });

        test('Multiline Statements with Strings and Comments', () => {
            const content = 'text = (\n    "This is a string with (parentheses)"\n    # This is a comment with [brackets]\n)';
            const expectedSelection = 'text = (\n    "This is a string with (parentheses)"\n    # This is a comment with [brackets]\n)';
            const doc = new MockTextDocument(content);
            const editor = new MockTextEditor(doc);
            editor.selection = new vscode.Selection(1, 0, 1, 0); // Cursor on string
            
            const selectedText = smartSelect(editor);
            
            assert.strictEqual(editor.selection.start.line, 0);
            assert.strictEqual(editor.selection.end.line, 3);
            assert.strictEqual(selectedText, expectedSelection);
        });

        test('Cursor on the Closing Line', () => {
            const content = 'my_dict = {\n    "a": 1,\n    "b": 2\n}';
            const expectedSelection = 'my_dict = {\n    "a": 1,\n    "b": 2\n}';
            const doc = new MockTextDocument(content);
            const editor = new MockTextEditor(doc);
            editor.selection = new vscode.Selection(3, 0, 3, 0); // Cursor on }
            
            const selectedText = smartSelect(editor);
            
            assert.strictEqual(editor.selection.start.line, 0);
            assert.strictEqual(editor.selection.end.line, 3);
            assert.strictEqual(selectedText, expectedSelection);
        });

        test('Cursor on the Opening Line', () => {
            const content = 'my_tuple = (\n    1,\n    2\n)';
            const expectedSelection = 'my_tuple = (\n    1,\n    2\n)';
            const doc = new MockTextDocument(content);
            const editor = new MockTextEditor(doc);
            editor.selection = new vscode.Selection(0, 0, 0, 0); // Cursor on my_tuple = (
            
            const selectedText = smartSelect(editor);
            
            assert.strictEqual(editor.selection.start.line, 0);
            assert.strictEqual(editor.selection.end.line, 3);
            assert.strictEqual(selectedText, expectedSelection);
        });

        test('Complex Interactive Session Elements', () => {
            const content = '@decorator\ndef timer(func, *args, **kw):\n    time_start = time.time()\n    res = func(\n        *args,\n        **kw\n    )\n    return res';
            const expectedSelection = '    res = func(\n        *args,\n        **kw\n    )';
            const doc = new MockTextDocument(content);
            const editor = new MockTextEditor(doc);
            editor.selection = new vscode.Selection(4, 0, 4, 0); // Cursor on *args,
            
            const selectedText = smartSelect(editor);
            
            assert.strictEqual(editor.selection.start.line, 3);
            assert.strictEqual(editor.selection.end.line, 6);
            assert.strictEqual(selectedText, expectedSelection);
        });

        test('Multiple Independent Multiline Statements', () => {
            const content = 'first_list = [\n    1,\n    2\n]\n\nsecond_list = [\n    3,\n    4\n]';
            const expectedSelection = 'second_list = [\n    3,\n    4\n]';
            const doc = new MockTextDocument(content);
            const editor = new MockTextEditor(doc);
            editor.selection = new vscode.Selection(7, 0, 7, 0); // Cursor on 4
            
            const selectedText = smartSelect(editor);
            
            assert.strictEqual(editor.selection.start.line, 5);
            assert.strictEqual(editor.selection.end.line, 8);
            assert.strictEqual(selectedText, expectedSelection);
        });

        test('Multiline Statement Inside If Block', () => {
            const content = 'if True:\n    my_list = [\n        1,\n        2\n    ]\nelse:\n    pass';
            const expectedSelection = '    my_list = [\n        1,\n        2\n    ]';
            const doc = new MockTextDocument(content);
            const editor = new MockTextEditor(doc);
            editor.selection = new vscode.Selection(1, 0, 1, 0); // Cursor on my_list = [
            
            const selectedText = smartSelect(editor);
            
            assert.strictEqual(editor.selection.start.line, 1);
            assert.strictEqual(editor.selection.end.line, 4);
            assert.strictEqual(selectedText, expectedSelection);
        });
    });
});;