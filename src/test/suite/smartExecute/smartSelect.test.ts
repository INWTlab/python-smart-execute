import * as assert from 'assert';
import * as vscode from 'vscode';
import { smartSelect } from '../../../smartExecute/selection';
import { MockTextDocument, MockTextEditor } from '../mocks';
import { getConfigSmartExecute } from '../../../smartExecute/config';

suite('SmartSelect Behavior Test Suite', () => {
    test('Single line selection when smart selection is disabled', () => {
        const content = 'x = 1';
        const doc = new MockTextDocument(content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(0, 0, 0, 0); // Cursor at start of line
        
        // Mock getConfigSmartExecute to return false
        const originalGetConfig = getConfigSmartExecute;
        (getConfigSmartExecute as unknown as () => boolean) = () => false;
        
        const selectedText = smartSelect(editor);
        
        assert.strictEqual(editor.selection.start.line, 0);
        assert.strictEqual(editor.selection.end.line, 0);
        assert.strictEqual(selectedText, 'x = 1');
        
        // Restore original function
        (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
    });

    test('Function selection with decorators', () => {
        const content = '@timer\ndef some_function(x):\n    return x\n';
        const expectedSelection = '@timer\ndef some_function(x):\n    return x';
        const doc = new MockTextDocument(content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(1, 0, 1, 0); // Cursor on function definition
        
        // Mock getConfigSmartExecute to return true for smart selection
        const originalGetConfig = getConfigSmartExecute;
        (getConfigSmartExecute as unknown as () => boolean) = () => true;
        
        const selectedText = smartSelect(editor);
        
        // The selection should include the decorator and the function body
        assert.strictEqual(editor.selection.start.line, 0);
        assert.strictEqual(editor.selection.end.line, 2);
        assert.strictEqual(selectedText, expectedSelection);
        
        // Restore original function
        (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
    });

    test('Class selection with decorators', () => {
        const content = '@dataclass\nclass Person:\n    name: str\n    age: int\n';
        const expectedSelection = '@dataclass\nclass Person:\n    name: str\n    age: int';
        const doc = new MockTextDocument(content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(1, 0, 1, 0); // Cursor on class definition
        
        // Mock getConfigSmartExecute to return true for smart selection
        const originalGetConfig = getConfigSmartExecute;
        (getConfigSmartExecute as unknown as () => boolean) = () => true;
        
        const selectedText = smartSelect(editor);
        
        // The selection should include the decorator and the entire class
        assert.strictEqual(editor.selection.start.line, 0);
        assert.strictEqual(editor.selection.end.line, 3);
        assert.strictEqual(selectedText, expectedSelection);
        
        // Restore original function
        (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
    });

    test('Control flow selection (if/elif/else)', () => {
        const content = 'if x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")\n';
        const expectedSelection = 'if x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")';
        const doc = new MockTextDocument(content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(0, 0, 0, 0); // Cursor on if line (current implementation limitation)
        
        // Mock getConfigSmartExecute to return true for smart selection
        const originalGetConfig = getConfigSmartExecute;
        (getConfigSmartExecute as unknown as () => boolean) = () => true;
        
        const selectedText = smartSelect(editor);
        
        // The selection should include the entire if/elif/else block
        assert.strictEqual(editor.selection.start.line, 0);
        assert.strictEqual(editor.selection.end.line, 5);
        assert.strictEqual(selectedText, expectedSelection);
        
        // Restore original function
        (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
    });

    test('Multi-line statement selection (dictionary)', () => {
        const content = 'data = {\n    "key1": "value1",\n    "key2": "value2",\n    "key3": "value3"\n}\n';
        const expectedSelection = 'data = {\n    "key1": "value1",\n    "key2": "value2",\n    "key3": "value3"\n}';
        const doc = new MockTextDocument(content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(0, 0, 0, 0); // Cursor on the assignment line (current implementation limitation)
        
        // Mock getConfigSmartExecute to return true for smart selection
        const originalGetConfig = getConfigSmartExecute;
        (getConfigSmartExecute as unknown as () => boolean) = () => true;
        
        const selectedText = smartSelect(editor);
        
        // The selection should include the entire multi-line dictionary
        assert.strictEqual(editor.selection.start.line, 0);
        assert.strictEqual(editor.selection.end.line, 4);
        assert.strictEqual(selectedText, expectedSelection);
        
        // Restore original function
        (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
    });

    test('Multi-block document selection (target specific function)', () => {
        const content = 'def first_function():\n    pass\n\n@timer\ndef target_function(x):\n    return x\n\ndef last_function():\n    pass\n';
        const expectedSelection = '@timer\ndef target_function(x):\n    return x';
        const doc = new MockTextDocument(content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(4, 0, 4, 0); // Cursor on target_function definition (not decorator)
        
        // Mock getConfigSmartExecute to return true for smart selection
        const originalGetConfig = getConfigSmartExecute;
        (getConfigSmartExecute as unknown as () => boolean) = () => true;
        
        const selectedText = smartSelect(editor);
        
        // The selection should include only the target function with its decorator
        assert.strictEqual(editor.selection.start.line, 3);
        assert.strictEqual(editor.selection.end.line, 5);
        assert.strictEqual(selectedText, expectedSelection);
        
        // Restore original function
        (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
    });

    test('Edge case: empty lines and comments', () => {
        const content = 'def first_function():\n    pass\n\n# This is a comment\n\n@timer\ndef target_function(x):\n    return x\n\n# Another comment\n\ndef last_function():\n    pass\n';
        const expectedSelection = '@timer\ndef target_function(x):\n    return x';
        const doc = new MockTextDocument(content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(6, 0, 6, 0); // Cursor on target_function definition (not decorator)
        
        // Mock getConfigSmartExecute to return true for smart selection
        const originalGetConfig = getConfigSmartExecute;
        (getConfigSmartExecute as unknown as () => boolean) = () => true;
        
        const selectedText = smartSelect(editor);
        
        // The selection should include only the target function with its decorator, skipping comments and empty lines
        assert.strictEqual(editor.selection.start.line, 5);
        assert.strictEqual(editor.selection.end.line, 7);
        assert.strictEqual(selectedText, expectedSelection);
        
        // Restore original function
        (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
    });

    suite('Multiline Statement Selection Tests', () => {
        let originalGetConfig: any;

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
    });
});;