# Technical Specification: SmartSelect Behavior Tests

## 1. File Structure
The following files will be created or modified to implement behavior-driven tests for the `smartSelect` function:

### New Files
- `src/test/suite/smartExecute/smartSelect.test.ts`: **New test file** for testing the behavior of the `smartSelect` function.
- `src/test/suite/smartExecute/selectionUtils.test.ts`: **Refactored test file** for testing utility functions (e.g., `isDecorator`, `findNextCodeLine`).

### Modified Files
- `src/test/suite/mocks.ts`: **Enhanced mocks** for `vscode.TextDocument`, `vscode.TextLine`, and `vscode.TextEditor` to better simulate the VS Code API.

### Existing Files
- `src/smartExecute/selection.ts`: The implementation of `smartSelect` and supporting logic. **No changes will be made to this file.**
- `src/test/suite/smartExecute/selection.test.ts`: **Existing test file** for implementation details. Some tests will be migrated to `selectionUtils.test.ts`.


---

## 2. API / Function Signatures

### `smartSelect.test.ts`
This file will contain **behavior-driven tests** for the `smartSelect` function. The tests will verify the following scenarios:

#### Test Cases
1. **Single Line Selection**
   - **Scenario**: `getConfigSmartExecute()` is `false`.
   - **Test**: `testSingleLineSelection()`
   - **Input**: Cursor on a line of code.
   - **Expected Output**: Only the current line is selected.

2. **Function Selection**
   - **Scenario**: Cursor is inside a function definition.
   - **Test**: `testFunctionSelection()`
   - **Input**: Cursor inside a function with decorators.
   - **Expected Output**: The entire function, including decorators, is selected.

3. **Class Selection**
   - **Scenario**: Cursor is inside a class definition.
   - **Test**: `testClassSelection()`
   - **Input**: Cursor inside a class with decorators.
   - **Expected Output**: The entire class, including decorators, is selected.

4. **Control Flow Selection**
   - **Scenario**: Cursor is inside an `if/elif/else`, `try/except/finally`, or `with` block.
   - **Test**: `testControlFlowSelection()`
   - **Input**: Cursor inside a control flow block.
   - **Expected Output**: The entire block is selected.

5. **Multi-Line Statement Selection**
   - **Scenario**: Cursor is inside a multi-line statement (e.g., dictionary, function call).
   - **Test**: `testMultiLineStatementSelection()`
   - **Input**: Cursor inside a multi-line statement.
   - **Expected Output**: The entire multi-line statement is selected.

6. **Multi-Block Documents**
   - **Scenario**: Document contains multiple blocks (e.g., functions, classes, control flow).
   - **Test**: `testMultiBlockDocument()`
   - **Input**: Cursor inside a block that is preceded or followed by other blocks.
   - **Expected Output**: Only the target block is selected.

7. **Edge Cases**
   - **Scenario**: Empty lines, comments, or whitespace.
   - **Test**: `testEdgeCases()`
   - **Input**: Cursor on an empty line, comment, or whitespace.
   - **Expected Output**: The selection behaves as expected (e.g., skips comments, handles whitespace).


### `selectionUtils.test.ts`
This file will contain **unit tests** for utility functions. The following functions will be tested:

1. **`isDecorator(text: string): boolean`**
   - **Test**: `testIsDecorator()`
   - **Input**: A line of text.
   - **Expected Output**: `true` if the line is a decorator, `false` otherwise.

2. **`findNextCodeLine(line: vscode.TextLine, document: vscode.TextDocument): vscode.TextLine`**
   - **Test**: `testFindNextCodeLine()`
   - **Input**: A line in a document.
   - **Expected Output**: The next line of code, skipping decorators, comments, and whitespace.

3. **`findMultiLineStatement(currentLine: vscode.TextLine, document: vscode.TextDocument, startLine: vscode.TextLine, endLine: vscode.TextLine): vscode.TextLine | undefined`**
   - **Test**: `testFindMultiLineStatement()`
   - **Input**: A line inside a multi-line statement.
   - **Expected Output**: The line where the multi-line statement ends.


### `mocks.ts`
The mocks will be enhanced to support the following:

1. **`MockTextDocument`**
   - **`getText(range?: vscode.Range): string`**: Respect the `Range` parameter to return only the text within the specified range.
   - **`lineAt(line: number | vscode.Position): vscode.TextLine`**: Return a `MockTextLine` with the correct line number and text.

2. **`MockTextLine`**
   - **`lineNumber: number`**: Return the correct line number.
   - **`text: string`**: Return the text of the line.
   - **`firstNonWhitespaceCharacterIndex: number`**: Return the index of the first non-whitespace character.
   - **`isEmptyOrWhitespace: boolean`**: Return `true` if the line is empty or contains only whitespace.

3. **`MockTextEditor`** (New)
   - **`selection: vscode.Selection`**: Simulate the editor's selection.
   - **`document: vscode.TextDocument`**: Return a `MockTextDocument`.
   - **`setSelection(selection: vscode.Selection): void`**: Update the editor's selection.


---

## 3. Test Cases

### `smartSelect.test.ts`

#### Test Case 1: Single Line Selection
```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';
import { smartSelect } from '../../../smartExecute/selection';
import { MockTextDocument, MockTextEditor } from '../../mocks';

suite('SmartSelect Behavior Test Suite', () => {
    test('Single line selection when smart selection is disabled', () => {
        const content = 'x = 1';
        const doc = new MockTextDocument(content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(0, 0, 0, 0); // Cursor at start of line
        
        // Mock getConfigSmartExecute to return false
        const originalGetConfig = getConfigSmartExecute;
        getConfigSmartExecute = () => false;
        
        smartSelect(editor);
        
        assert.strictEqual(editor.selection.start.line, 0);
        assert.strictEqual(editor.selection.end.line, 0);
        assert.strictEqual(editor.document.getText(editor.selection), 'x = 1');
        
        // Restore original function
        getConfigSmartExecute = originalGetConfig;
    });
});
```


#### Test Case 2: Function Selection
```typescript
test('Function selection with decorators', () => {
    const content = '@timer\ndef some_function(x):\n    return x\n';
    const doc = new MockTextDocument(content);
    const editor = new MockTextEditor(doc);
    editor.selection = new vscode.Selection(1, 0, 1, 0); // Cursor on function definition
    
    smartSelect(editor);
    
    assert.strictEqual(editor.selection.start.line, 0);
    assert.strictEqual(editor.selection.end.line, 2);
    assert.strictEqual(editor.document.getText(editor.selection), content);
});
```


#### Test Case 3: Multi-Block Document
```typescript

test('Function between other functions', () => {
    const content = 'def first_function():\n    pass\n\n@timer\ndef target_function(x):\n    return x\n\ndef last_function():\n    pass';
    const doc = new MockTextDocument(content);
    const editor = new MockTextEditor(doc);
    editor.selection = new vscode.Selection(3, 0, 3, 0); // Cursor on target_function definition
    
    smartSelect(editor);
    
    assert.strictEqual(editor.selection.start.line, 2);
    assert.strictEqual(editor.selection.end.line, 4);
    assert.strictEqual(
        editor.document.getText(editor.selection),
        '@timer\ndef target_function(x):\n    return x'
    );
});
```


#### Test Case 4: Control Flow Inside Function
```typescript

test('Control flow inside function', () => {
    const content = 'def some_function(x):\n    if x > 0:\n        return x\n    else:\n        return 0';
    const doc = new MockTextDocument(content);
    const editor = new MockTextEditor(doc);
    editor.selection = new vscode.Selection(2, 4, 2, 4); // Cursor inside if block
    
    smartSelect(editor);
    
    assert.strictEqual(editor.selection.start.line, 1);
    assert.strictEqual(editor.selection.end.line, 4);
    assert.strictEqual(
        editor.document.getText(editor.selection),
        'def some_function(x):\n    if x > 0:\n        return x\n    else:\n        return 0'
    );
});
```


### `selectionUtils.test.ts`

#### Test Case 1: `isDecorator`
```typescript
import { isDecorator } from '../../../smartExecute/selection';
import * as assert from 'assert';

suite('Selection Utils Test Suite', () => {
    test('isDecorator basic', () => {
        assert.strictEqual(isDecorator('@dataclass'), true);
        assert.strictEqual(isDecorator('def foo():'), false);
    });
});
```


#### Test Case 2: `findNextCodeLine`
```typescript
import { findNextCodeLine } from '../../../smartExecute/selection';
import { MockTextDocument } from '../../mocks';

suite('findNextCodeLine', () => {
    test('Skip decorators when finding next code line', () => {
        const content = 'x = 1\n\n@timer\ndef another_function():\n    pass';
        const doc = new MockTextDocument(content);
        const firstLine = doc.lineAt(0);
        const nextLine = findNextCodeLine(firstLine, doc);
        
        assert.strictEqual(nextLine.lineNumber, 3);
    });
});
```


---

## 4. Mock Enhancements

### `MockTextDocument`
```typescript
class MockTextDocument implements vscode.TextDocument {
    // ... existing code ...
    
    getText(range?: vscode.Range): string {
        if (!range) {
            return this._content;
        }
        const lines = this._content.split('\n');
        const startLine = range.start.line;
        const endLine = range.end.line;
        const startChar = range.start.character;
        const endChar = range.end.character;
        
        if (startLine === endLine) {
            return lines[startLine].substring(startChar, endChar);
        }
        
        let result = lines[startLine].substring(startChar) + '\n';
        for (let i = startLine + 1; i < endLine; i++) {
            result += lines[i] + '\n';
        }
        result += lines[endLine].substring(0, endChar);
        return result;
    }
}
```

### `MockTextEditor`
```typescript
class MockTextEditor implements vscode.TextEditor {
    document: vscode.TextDocument;
    selection: vscode.Selection;
    
    constructor(document: vscode.TextDocument) {
        this.document = document;
        this.selection = new vscode.Selection(0, 0, 0, 0);
    }
    
    setSelection(selection: vscode.Selection): void {
        this.selection = selection;
    }
    
    // ... other required methods ...
}

---

## 5. Robust Selection Empty Check

### New Utility Function
A new utility function `isSelectionEmpty` will be added to handle cases where the `isEmpty` property might be undefined (e.g., in test environments):

```typescript
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
```

### Updated `smartSelect` Function
The `smartSelect` function will be updated to use the new utility:

```typescript
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
```

### Test Cases for `isSelectionEmpty`
The `selectionUtils.test.ts` file will include tests for the new utility function:

```typescript
test('isSelectionEmpty with standard Selection', () => {
    const emptySelection = new vscode.Selection(0, 0, 0, 0);
    const nonEmptySelection = new vscode.Selection(0, 0, 0, 5);
    
    assert.strictEqual(isSelectionEmpty(emptySelection), true);
    assert.strictEqual(isSelectionEmpty(nonEmptySelection), false);
});

// Test the fallback behavior by mocking a Selection without isEmpty
class MockSelectionWithoutIsEmpty extends vscode.Selection {
    constructor(startLine: number, startChar: number, endLine: number, endChar: number) {
        super(startLine, startChar, endLine, endChar);
    }
    
    // Intentionally omit isEmpty to test fallback
}

test('isSelectionEmpty with Selection without isEmpty property', () => {
    const emptySelection = new MockSelectionWithoutIsEmpty(0, 0, 0, 0);
    const nonEmptySelection = new MockSelectionWithoutIsEmpty(0, 0, 0, 5);
    
    assert.strictEqual(isSelectionEmpty(emptySelection), true);
    assert.strictEqual(isSelectionEmpty(nonEmptySelection), false);
});
```