# User Story: Test Refactoring - DocumentState and expectSelection Facility

## Feature Goal
Create a test utility facility to eliminate repetitive boilerplate in `smartSelect.test.ts`, reducing test code from ~20 lines to ~2 lines per test case while maintaining full test coverage and clarity.

## Context & Motivation
When writing unit tests for smart selection, developers must repeat the same setup and teardown code in every test: creating documents, positioning cursors, mocking configuration, calling smartSelect, asserting results, and restoring mocks. This makes tests verbose, harder to read, and tedious to maintain. The current 8 tests at the top level contain identical patterns with only 4 values changing per test (content, cursor position, expected range, smartExecute flag).

## Expected Behavior
A `DocumentState` class encapsulates document content and cursor position, and an `expectSelection` function handles all setup, execution, assertion, and teardown in a single call. Tests become concise one-liners that clearly express intent: "given this document state, expect this selection range."

## Current Behavior
Each test manually:
1. Creates `MockTextDocument` with content
2. Creates `MockTextEditor` with document
3. Sets `editor.selection` to cursor position
4. Saves original `getConfigSmartExecute`
5. Mocks `getConfigSmartExecute` to return true/false
6. Calls `smartSelect(editor)`
7. Asserts `start.line`, `end.line`, and `selectedText`
8. Restores original `getConfigSmartExecute`

## Examples

### Example 1: Function with Decorator (Happy Path)
**Current Code (verbose):**
```typescript
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
```

**After Refactoring (concise):**
```typescript
test('Function selection with decorators', () => {
    const state = new DocumentState('@timer\ndef some_function(x):\n    return x\n', 1, 0);
    expectSelection(state, 0, 2);
});
```

This demonstrates the most common pattern: smart execute enabled (default), cursor on def line (not decorator), selection expands to include decorator and function body.

### Example 2: Multi-line Statement (Edge Case)
**Current Code (verbose):**
```typescript
test('Multi-line statement selection (dictionary)', () => {
    const content = 'data = {\n    "key1": "value1",\n    "key2": "value2",\n    "key3": "value3"\n}\n';
    const expectedSelection = 'data = {\n    "key1": "value1",\n    "key2": "value2",\n    "key3": "value3"\n}';
    const doc = new MockTextDocument(content);
    const editor = new MockTextEditor(doc);
    editor.selection = new vscode.Selection(0, 0, 0, 0); // Cursor on the assignment line
    
    const originalGetConfig = getConfigSmartExecute;
    (getConfigSmartExecute as unknown as () => boolean) = () => true;
    
    const selectedText = smartSelect(editor);
    
    assert.strictEqual(editor.selection.start.line, 0);
    assert.strictEqual(editor.selection.end.line, 4);
    assert.strictEqual(selectedText, expectedSelection);
    
    (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
});
```

**After Refactoring (concise):**
```typescript
test('Multi-line statement selection (dictionary)', () => {
    const state = new DocumentState('data = {\n    "key1": "value1",\n    "key2": "value2",\n    "key3": "value3"\n}\n', 0, 0);
    expectSelection(state, 0, 4);
});
```

This demonstrates multi-line bracket matching where cursor is on opening line and selection spans 5 lines to include closing bracket. Smart execute is enabled by default.

### Example 3: Control Flow Block (Complex Scenario)
**Current Code (verbose):**
```typescript
test('Control flow selection (if/elif/else)', () => {
    const content = 'if x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")\n';
    const expectedSelection = 'if x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")';
    const doc = new MockTextDocument(content);
    const editor = new MockTextEditor(doc);
    editor.selection = new vscode.Selection(0, 0, 0, 0); // Cursor on if line
    
    const originalGetConfig = getConfigSmartExecute;
    (getConfigSmartExecute as unknown as () => boolean) = () => true;
    
    const selectedText = smartSelect(editor);
    
    assert.strictEqual(editor.selection.start.line, 0);
    assert.strictEqual(editor.selection.end.line, 5);
    assert.strictEqual(selectedText, expectedSelection);
    
    (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
});
```

**After Refactoring (concise):**
```typescript
test('Control flow selection (if/elif/else)', () => {
    const state = new DocumentState('if x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")\n', 0, 0);
    expectSelection(state, 0, 5);
});
```

This demonstrates control flow block selection spanning 6 lines including if, elif, else branches. Smart execute is enabled by default.

### Example 4: Without Smart Execute (Config Variation)
**Current Code (verbose):**
```typescript
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
```

**After Refactoring (concise):**
```typescript
test('Single line selection when smart selection is disabled', () => {
    const state = new DocumentState('x = 1', 0, 0);
    expectSelection(state, 0, 0, {smartExecute: false});
});
```

This demonstrates config variation where smartExecute is disabled, resulting in single-line selection regardless of content.

## Acceptance Criteria
- [ ] Criterion 1: `DocumentState` class exists in `src/test/suite/smartExecute/testHelpers.ts`
- [ ] Criterion 2: `DocumentState` constructor accepts `(content: string, cursorLine: number, cursorChar: number)`
- [ ] Criterion 3: `DocumentState.createEditor()` returns `MockTextEditor` with `MockTextDocument` and cursor position set
- [ ] Criterion 4: `expectSelection(state, startLine, endLine, options?)` function exists
- [ ] Criterion 5: `expectSelection` creates editor from state, mocks config based on `options.smartExecute` (defaults to true), calls `smartSelect`, asserts selection range and text, restores config
- [ ] Criterion 6: `expectSelection` derives expected text from content using startLine/endLine (not passed as parameter)
- [ ] Criterion 7: All 8 top-level tests in `smartSelect.test.ts` refactored to use new facility
- [ ] Criterion 8: Nested suite "Multiline Statement Selection Tests" tests remain unchanged (uses setup/teardown)
- [ ] Criterion 9: All refactored tests pass with `npm run test:unit`
- [ ] Criterion 10: Refactored tests are functionally equivalent (same assertions, same behavior)

## Technical Constraints
- Must work with existing `MockTextDocument` and `MockTextEditor` in `src/test/suite/mocks.ts`
- Must be compatible with Mocha TDD interface (`suite`/`test`)
- Must not modify `MockTextDocument` or `MockTextEditor` classes
- Must use same config mocking pattern as existing tests (cast to unknown then to function type)
- `expectSelection` must derive expected text from document content using line range
- New file `testHelpers.ts` must be created in `src/test/suite/smartExecute/` directory

## Assumptions
- The facility will only be used for `smartSelect.test.ts` initially (not other test files)
- The nested suite with setup/teardown will not be refactored in this story
- `expectSelection` options parameter is optional with `smartExecute` defaulting to `true`
- Tests only need to specify `{smartExecute: false}` when testing the disabled behavior
- The facility will only test `smartSelect` function, not other functions

## Out of Scope
- Navigation tests (`blockFinder.test.ts`, `blockNavigator.test.ts`, `multiLineStatement.test.ts`) are explicitly excluded
- `selection.test.ts` and `selectionUtils.test.ts` are out of scope for this story
- Nested suite "Multiline Statement Selection Tests" (lines 160-296) will not be refactored
- No changes to production code in `src/smartExecute/`
- No changes to mock implementations in `mocks.ts`

## Dependencies
- Depends on existing `MockTextDocument` and `MockTextEditor` in `src/test/suite/mocks.ts`
- Depends on `smartSelect` function from `src/smartExecute/selection.ts`
- Depends on `getConfigSmartExecute` from `src/smartExecute/config.ts`
- Blocks future refactoring stories for other test files (establishes pattern)
