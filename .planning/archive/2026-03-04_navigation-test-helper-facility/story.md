# User Story: Navigation Test Helper Facility

## Feature Goal
Create a test helper facility for navigation module tests that reduces boilerplate code from ~15 lines to ~2 lines per test, mirroring the successful pattern established in `smartExecute/testHelpers.ts`.

## Context & Motivation
The smartExecute module already has a well-designed test helper facility (`DocumentState` + `expectSelection`) that dramatically reduced test verbosity. The navigation module tests currently use a verbose pattern with repetitive MockTextDocument creation, vscode.Position construction, and assertion code. This makes tests harder to read, slower to write, and more prone to copy-paste errors.

**Current pain point** - Writing a navigation test requires:
1. Creating MockTextDocument with content
2. Creating vscode.Position for cursor
3. Calling the navigation function
4. Asserting the result line

## Expected Behavior
Developers should be able to write navigation tests in 1-2 lines by reusing `DocumentState` and using a new `expectCursorPosition` helper that abstracts away document creation, position construction, and assertion logic.

## Current Behavior (for bugs)
N/A - This is a new test infrastructure feature.

## Examples

### Example 1: Basic Navigation Test - Before/After

**Before (current verbose pattern):**
```typescript
test('should navigate to next function', () => {
    const content = `def function1():
    pass

def function2():
    pass`;
    const doc = new MockTextDocument(content);
    const position = new vscode.Position(0, 0);
    
    const result = jumpNextBlock(doc, position);
    
    assert.strictEqual(result.line, 3);
});
```

**After (with test helper):**
```typescript
test('should navigate to next function', () => {
    const state = new DocumentState('def function1():\n    pass\n\ndef function2():\n    pass', 0, 0);
    expectCursorPosition(state, 'next', 3);
});
```

This demonstrates the core value: 15 lines reduced to 2 lines.

### Example 2: Edge Case - Document Boundary Fallback

**Before:**
```typescript
test('should have symmetric fallback at document end', () => {
    const content = `def function1():
    pass

def function2():
    pass`;
    const doc = new MockTextDocument(content);
    const position = new vscode.Position(3, 0);
    
    const result = jumpNextBlock(doc, position);
    
    assert.strictEqual(result.line, doc.lineCount - 1);
});
```

**After:**
```typescript
test('should have symmetric fallback at document end', () => {
    const state = new DocumentState('def function1():\n    pass\n\ndef function2():\n    pass', 3, 0);
    expectCursorPosition(state, 'next', 'last-line');
});
```

Shows edge case handling with special expected value `'last-line'` for document boundaries.

### Example 3: Indentation-Aware Navigation

**Before:**
```typescript
test('should navigate to same-level next block using indentation', () => {
    const content = `def outer():
    def inner1():
        def deeply_nested():
            pass
    
    def inner2():
        pass

def another_function():
    pass`;
    const doc = new MockTextDocument(content);
    const position = new vscode.Position(1, 0);
    
    const result = jumpNextBlock(doc, position);
    
    assert.strictEqual(result.line, 5);
});
```

**After:**
```typescript
test('should navigate to same-level next block using indentation', () => {
    const content = 'def outer():\n    def inner1():\n        def deeply_nested():\n            pass\n    \n    def inner2():\n        pass\n\ndef another_function():\n    pass';
    const state = new DocumentState(content, 1, 0);
    expectCursorPosition(state, 'next', 5);
});
```

Demonstrates complex multi-line content with indentation-aware assertion.

### Example 4: Previous Block Navigation

**Before:**
```typescript
test('should navigate to same-level previous block using indentation', () => {
    const content = `def outer():
    def inner1():
        def deep():
            pass
    
    def inner2():
        pass`;
    const doc = new MockTextDocument(content);
    const position = new vscode.Position(5, 0);
    
    const result = jumpPreviousBlock(doc, position);
    
    assert.strictEqual(result.line, 1);
});
```

**After:**
```typescript
test('should navigate to same-level previous block using indentation', () => {
    const content = 'def outer():\n    def inner1():\n        def deep():\n            pass\n    \n    def inner2():\n        pass';
    const state = new DocumentState(content, 5, 0);
    expectCursorPosition(state, 'previous', 1);
});
```

Shows that direction is specified as a string parameter ('next' or 'previous').

## Acceptance Criteria
- [ ] `DocumentState` class is reused from `smartExecute/testHelpers.ts` (no duplication)
- [ ] `expectCursorPosition` function accepts: `state: DocumentState`, `direction: 'next' | 'previous'`, `expectedLine: number | 'first-line' | 'last-line'`
- [ ] Helper correctly imports and calls `jumpNextBlock` and `jumpPreviousBlock` from `../../navigation/blockNavigator`
- [ ] Helper asserts both `result.line` and `result.character` (character defaults to 0)
- [ ] Optional parameter for expected character position: `expectCursorPosition(state, 'next', 3, { character: 5 })`
- [ ] Special values `'first-line'` and `'last-line'` resolve to `0` and `doc.lineCount - 1` respectively
- [ ] All existing 9 tests in `blockNavigator.test.ts` are refactored to use the new helper
- [ ] Test count remains the same (9 tests) - no behavior changes
- [ ] New helper is exported from `navigation/testHelpers.ts` (separate file, not in smartExecute folder)

## Technical Constraints
- Must use existing `MockTextDocument` from `../mocks.ts`
- Must use existing `vscode.Position` and `vscode.Selection` patterns
- Must follow the same pattern as `expectSelection` for consistency
- Helper should be in a new file: `src/test/suite/navigation/testHelpers.ts`
- TypeScript strict mode compliance required

## Assumptions
- `DocumentState` class is already exported and can be imported from `../smartExecute/testHelpers`
- Navigation functions always return character position 0 (block headers start at column 0)
- Test coverage is adequate with existing 9 tests - no new test cases needed
- The helper will only be used for `blockNavigator.test.ts` initially

## Out of Scope
- Modifying low-level `blockFinder.test.ts` unit tests (those test utility functions directly)
- Adding new test cases beyond the existing 9
- Creating helpers for other modules
- Changing the behavior of navigation functions themselves
- Performance testing of the helper

## Dependencies
- Depends on: Existing `DocumentState` class being properly exported
- Blocks: None (this is test infrastructure only)
- Enables: Faster future test writing for navigation features
