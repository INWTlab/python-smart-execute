# Technical Specification: Test Refactoring - DocumentState and expectSelection Facility

## 1. Files to Modify

- `src/test/suite/smartExecute/smartSelect.test.ts`: Refactor 8 top-level tests to use new facility
  - Current behavior: 8 tests with ~20 lines of boilerplate each
  - New behavior: 8 tests with ~2-3 lines using DocumentState and expectSelection
  - Lines affected: 8-158 (top-level tests only)
  - Lines UNCHANGED: 160-296 (nested suite with setup/teardown)

## 2. Files to Create

- `src/test/suite/smartExecute/testHelpers.ts`: New test utility module
  - Purpose: Provide DocumentState class and expectSelection function
  - Exports: DocumentState class, expectSelection function, ExpectSelectionOptions interface

- `src/test/suite/smartExecute/testHelpers.test.ts`: Unit tests for test helpers
  - Purpose: Verify DocumentState and expectSelection work correctly
  - Test coverage: DocumentState.createEditor(), expectSelection text derivation, config mocking/restoration

## 3. Implementation Approach

### 3.1 DocumentState Class

**Location**: `src/test/suite/smartExecute/testHelpers.ts`

**Constructor**:
- Parameters: `(content: string, cursorLine: number, cursorChar: number)`
- Store content, cursorLine, cursorChar as readonly properties

**createEditor() method**:
- Returns: `MockTextEditor`
- Implementation approach:
  1. Create `new MockTextDocument(this.content)`
  2. Create `new MockTextEditor(doc)`
  3. Set `editor.selection = new vscode.Selection(cursorLine, cursorChar, cursorLine, cursorChar)`
  4. Return editor

**Tools/Utilities to use**:
- MockTextDocument from '../mocks'
- MockTextEditor from '../mocks'
- vscode.Selection from 'vscode'

**Edge cases**:
- cursorLine/cursorChar out of bounds: Let MockTextDocument handle (current behavior)
- Empty content: Valid (single-line empty document)

### 3.2 ExpectSelectionOptions Interface

**Location**: `src/test/suite/smartExecute/testHelpers.ts`

**Definition**:
```typescript
interface ExpectSelectionOptions {
  smartExecute?: boolean; // Defaults to true
}
```

### 3.3 expectSelection Function

**Location**: `src/test/suite/smartExecute/testHelpers.ts`

**Signature**:
```typescript
function expectSelection(
  state: DocumentState,
  startLine: number,
  endLine: number,
  options?: ExpectSelectionOptions
): void
```

**Implementation Approach**:

1. **Extract options with defaults**:
   - smartExecute = options?.smartExecute ?? true

2. **Create editor from state**:
   - Call `state.createEditor()`

3. **Mock config**:
   - Save original: `const originalGetConfig = getConfigSmartExecute`
   - Mock: `(getConfigSmartExecute as unknown as () => boolean) = () => smartExecute`

4. **Call smartSelect**:
   - `const selectedText = smartSelect(editor)`

5. **Derive expected text from content**:
   - Split content by '\n' to get lines array
   - Extract lines from startLine to endLine (inclusive)
   - Join with '\n' to create expectedSelection
   - **IMPORTANT**: Do NOT include trailing newline after endLine

6. **Assert results**:
   - `assert.strictEqual(editor.selection.start.line, startLine)`
   - `assert.strictEqual(editor.selection.end.line, endLine)`
   - `assert.strictEqual(selectedText, expectedSelection)`

7. **Restore config**:
   - `(getConfigSmartExecute as unknown as () => boolean) = originalGetConfig`

**Algorithm for deriving expected text**:
```
lines = state.content.split('\n')
selectedLines = lines.slice(startLine, endLine + 1)
expectedSelection = selectedLines.join('\n')
```

**Tools/Utilities to use**:
- DocumentState.createEditor()
- smartSelect from '../../../smartExecute/selection'
- getConfigSmartExecute from '../../../smartExecute/config'
- assert from 'assert'

**Edge cases**:
- startLine === endLine: Single line selection (join returns single element)
- Content with trailing newline: Last element after split is empty string (handled correctly)
- startLine > endLine: Invalid (should not happen in practice)

### 3.4 Refactoring Tests

**Location**: `src/test/suite/smartExecute/smartSelect.test.ts`

**Approach**:
For each of the 8 top-level tests (lines 8-158):
1. Replace boilerplate with DocumentState + expectSelection
2. Import testHelpers: `import { DocumentState, expectSelection } from './testHelpers'`
3. Remove unused imports: MockTextDocument, MockTextEditor (keep for nested suite)
4. Remove direct import of getConfigSmartExecute (keep for nested suite setup/teardown)

**Example refactoring**:
```typescript
// BEFORE (20 lines)
test('Function selection with decorators', () => {
    const content = '@timer\ndef some_function(x):\n    return x\n';
    const expectedSelection = '@timer\ndef some_function(x):\n    return x';
    const doc = new MockTextDocument(content);
    const editor = new MockTextEditor(doc);
    editor.selection = new vscode.Selection(1, 0, 1, 0);
    
    const originalGetConfig = getConfigSmartExecute;
    (getConfigSmartExecute as unknown as () => boolean) = () => true;
    
    const selectedText = smartSelect(editor);
    
    assert.strictEqual(editor.selection.start.line, 0);
    assert.strictEqual(editor.selection.end.line, 2);
    assert.strictEqual(selectedText, expectedSelection);
    
    (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
});

// AFTER (3 lines)
test('Function selection with decorators', () => {
    const state = new DocumentState('@timer\ndef some_function(x):\n    return x\n', 1, 0);
    expectSelection(state, 0, 2);
});
```

**Tests with smartExecute=false**:
```typescript
// Only specify options when smartExecute is false
test('Single line selection when smart selection is disabled', () => {
    const state = new DocumentState('x = 1', 0, 0);
    expectSelection(state, 0, 0, {smartExecute: false});
});
```

## 4. Test Strategy

### 4.1 Unit Tests for testHelpers.ts

**File**: `src/test/suite/smartExecute/testHelpers.test.ts` (NEW)

**Test Suite**: 'Test Helpers Facility'

**Test Cases**:

1. **DocumentState.createEditor creates editor with correct document**
   - Given: DocumentState with content 'line1\nline2\nline3'
   - When: Call createEditor()
   - Then: editor.document.getText() equals 'line1\nline2\nline3'
   - Then: editor.document.lineCount equals 3

2. **DocumentState.createEditor sets cursor position**
   - Given: DocumentState(content, 2, 5)
   - When: Call createEditor()
   - Then: editor.selection.start.line equals 2
   - Then: editor.selection.start.character equals 5
   - Then: editor.selection.end.line equals 2
   - Then: editor.selection.end.character equals 5

3. **expectSelection with smartExecute=true mocks config correctly**
   - Given: DocumentState with simple function, expectSelection(..., {smartExecute: true})
   - When: Function executes
   - Then: Config is mocked to return true
   - Then: Config is restored after assertion

4. **expectSelection derives expected text correctly (single line)**
   - Given: content='x = 1\ny = 2', startLine=0, endLine=0
   - When: expectSelection executes
   - Then: Asserts selectedText equals 'x = 1'

5. **expectSelection derives expected text correctly (multi-line)**
   - Given: content='line1\nline2\nline3\n', startLine=0, endLine=2
   - When: expectSelection executes
   - Then: Asserts selectedText equals 'line1\nline2\nline3' (no trailing \n)

6. **expectSelection with smartExecute=false**
   - Given: DocumentState with multi-line content, {smartExecute: false}
   - When: expectSelection executes
   - Then: Config is mocked to return false
   - Then: Single line selection is asserted

7. **expectSelection restores config after assertion**
   - Given: Original config returns 'original-value'
   - When: expectSelection with {smartExecute: true} executes
   - Then: After execution, getConfigSmartExecute() returns 'original-value'

### 4.2 Refactored Tests Verification

**File**: `src/test/suite/smartExecute/smartSelect.test.ts`

**Approach**: Run existing test suite after refactoring

**Test command**: `npm run test:unit`

**Expected outcome**: All 8 refactored tests pass + 10 nested suite tests pass = 18 tests total

**Verification**:
- All assertions remain the same (functionally equivalent)
- No change in test coverage
- No change in behavior

## 5. Design Decisions

### 5.1 Separate testHelpers.ts file vs adding to mocks.ts

**Decision**: Create separate `testHelpers.ts` file

**Rationale**:
- mocks.ts contains VS Code API mocks (general purpose)
- testHelpers.ts contains test-specific utilities (smart execute tests)
- Separation of concerns: mocks vs test facilities
- Easier to extend for other test files in future
- Follows existing pattern (each module has its own file)

**Alternatives considered**:
- Add to mocks.ts: Would mix concerns, make mocks.ts larger
- Add to smartSelect.test.ts: Would not be reusable

**Trade-offs**:
- Pro: Better organization, reusability
- Con: One more file to maintain (minimal)

### 5.2 Options parameter vs separate parameters

**Decision**: Use options object with optional smartExecute property

**Rationale**:
- Allows future extensibility (add more options without breaking API)
- Default value (true) covers 7 out of 8 tests
- Only 1 test needs to specify {smartExecute: false}
- Clearer intent: `expectSelection(state, 0, 0, {smartExecute: false})`

**Alternatives considered**:
- Boolean parameter: `expectSelection(state, 0, 0, true)` - less readable, harder to extend
- No options, always true: Would not test disabled behavior

**Trade-offs**:
- Pro: Extensible, readable, covers all cases
- Con: Slightly more verbose than boolean parameter

### 5.3 Derive expected text vs pass as parameter

**Decision**: Derive expected text from content using startLine/endLine

**Rationale**:
- Eliminates redundant expectedSelection variable in tests
- Single source of truth: content string
- Reduces test code by 1 line per test
- Less prone to copy-paste errors

**Algorithm**:
```typescript
const lines = state.content.split('\n');
const selectedLines = lines.slice(startLine, endLine + 1);
const expectedSelection = selectedLines.join('\n');
```

**Edge case handling**:
- Content with trailing '\n': Split creates empty last element, but slice excludes it when endLine < lineCount-1
- Example: 'x = 1\n'.split('\n') = ['x = 1', ''], if endLine=0, slice(0,1) = ['x = 1'], join = 'x = 1' ✓

**Alternatives considered**:
- Pass expectedSelection as parameter: Would require test author to manually extract, more error-prone
- Use MockTextDocument.getText(range): Would require creating Range, more complex

**Trade-offs**:
- Pro: DRY principle, less boilerplate
- Con: Assumes newline separator (acceptable for this codebase)

### 5.4 Config mocking inside expectSelection vs external

**Decision**: Mock config inside expectSelection, restore before return

**Rationale**:
- Encapsulates all setup/teardown in one function
- Ensures config is always restored (no forgotten restoration)
- Matches existing test pattern (setup before, restore after)
- Reduces cognitive load for test authors

**Implementation**:
```typescript
const originalGetConfig = getConfigSmartExecute;
(getConfigSmartExecute as unknown as () => boolean) = () => smartExecute;
try {
  // ... test code ...
} finally {
  (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
}
```

**Alternatives considered**:
- External mocking: Test author must remember to mock and restore (error-prone)
- Use sinon/stub: Would introduce new dependency, overkill for simple mock

**Trade-offs**:
- Pro: Reliable, always restored, encapsulated
- Con: Uses type assertion (matches existing pattern)

### 5.5 DocumentState as class vs factory function

**Decision**: Use class with createEditor method

**Rationale**:
- Clear intent: DocumentState represents a state, createEditor creates editor from it
- Encapsulation: Content and cursor position stored together
- Extensibility: Can add more methods later (e.g., createDocument())
- Matches object-oriented style of existing mocks

**Alternatives considered**:
- Factory function: `createEditor(content, line, char)` - less expressive
- Plain object: `{content, cursorLine, cursorChar}` - no encapsulation

**Trade-offs**:
- Pro: Clear semantics, extensible, matches codebase style
- Con: Slightly more verbose than factory function (negligible)

## 6. External Dependencies

**Decision**: ☑ No new external dependencies needed

**Rationale**:
- Uses existing MockTextDocument, MockTextEditor
- Uses existing smartSelect function
- Uses existing getConfigSmartExecute function
- Uses Node.js built-in assert module
- Uses VS Code API types (already imported)

**Alternatives considered**:
- sinon for mocking: Overkill, existing pattern works fine
- jest/vitest: Would require migrating entire test suite

## 7. Implementation Order

1. Create `src/test/suite/smartExecute/testHelpers.ts` with DocumentState class
2. Add expectSelection function to testHelpers.ts
3. Create `src/test/suite/smartExecute/testHelpers.test.ts` with unit tests
4. Run testHelpers tests: `npm run test:unit`
5. Refactor first test in smartSelect.test.ts (e.g., line 28)
6. Run tests to verify refactoring works
7. Refactor remaining 7 tests
8. Run full test suite: `npm run test:unit`
9. Verify all 18 tests pass (8 refactored + 10 nested)

## 8. Risk Assessment

**Risk**: Deriving expected text incorrectly
- **Mitigation**: Write unit tests for expectSelection text derivation logic
- **Mitigation**: Test with various content patterns (single line, multi-line, trailing newline)

**Risk**: Config not restored if assertion throws
- **Mitigation**: Use try/finally to ensure restoration
- **Mitigation**: Write unit test to verify restoration after error

**Risk**: Breaking existing tests
- **Mitigation**: Refactor one test at a time, run tests after each
- **Mitigation**: Keep nested suite unchanged (uses setup/teardown)

**Risk**: Type errors with config mocking
- **Mitigation**: Use exact same pattern as existing tests (cast to unknown then function)
- **Mitigation**: TypeScript will catch type errors at compile time

---

**Quality Checklist**:
- [x] Files to modify clearly identified (smartSelect.test.ts lines 8-158)
- [x] Files to create clearly identified (testHelpers.ts, testHelpers.test.ts)
- [x] Implementation approach is clear (step-by-step for each component)
- [x] Tools/utilities to use are specified (MockTextDocument, smartSelect, assert, etc.)
- [x] Test scenarios use Given/When/Then format
- [x] Edge cases identified (trailing newline, single line, config restoration)
- [x] External dependencies decided (no new dependencies)
- [x] Design decisions documented with rationale and alternatives
