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
});;