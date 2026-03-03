# TDD Implementation Plan: Test Refactoring - DocumentState and expectSelection Facility

## Overview
Refactor 8 top-level tests in `smartSelect.test.ts` to use new test utility facility, reducing test code from ~20 lines to ~2-3 lines per test while maintaining full test coverage.

## Cycle 1: DocumentState Class
- [x] **STUB**: Create `src/test/suite/smartExecute/testHelpers.ts` with `DocumentState` class. Constructor signature: `constructor(content: string, cursorLine: number, cursorChar: number)`. Store as readonly properties. Add `createEditor()` method that returns `new MockTextEditor(new MockTextDocument(this.content))` with selection set (return dummy editor).
- [x] **TEST**: Create `src/test/suite/smartExecute/testHelpers.test.ts` with test suite 'Test Helpers Facility'. Add test: "DocumentState.createEditor creates editor with correct document" - verify `editor.document.getText()` equals content and `editor.document.lineCount` is correct.
- [ ] **VERIFY FAIL**: Run test command `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/testHelpers.test.js`. **Expect failure** (Red State - method not fully implemented).
- [x] **IMPLEMENT**: Update `DocumentState.createEditor()` in `testHelpers.ts` to: create MockTextDocument, create MockTextEditor, set `editor.selection = new vscode.Selection(this.cursorLine, this.cursorChar, this.cursorLine, this.cursorChar)`, return editor.
- [x] **VERIFY PASS**: Run test command `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/testHelpers.test.js`. **Expect pass** (Green State).
- [x] **REFACTOR**: Add second test "DocumentState.createEditor sets cursor position correctly" - verify selection start/end line and character match cursorLine/cursorChar. Re-run tests.
- [x] **VERIFY PASS**: Run test command `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/testHelpers.test.js`. **Expect pass** (both tests pass).

## Cycle 2: ExpectSelectionOptions Interface
- [x] **STUB**: Add `ExpectSelectionOptions` interface to `testHelpers.ts` with optional `smartExecute?: boolean` property.
- [x] **TEST**: No direct test needed (interface only, will be tested via expectSelection).
- [x] **VERIFY FAIL**: N/A (interface only).
- [x] **IMPLEMENT**: Interface is complete, no additional implementation needed.
- [x] **VERIFY PASS**: N/A.
- [x] **REFACTOR**: N/A.
- [x] **VERIFY PASS**: N/A.

## Cycle 3: expectSelection Function (Text Derivation)
- [x] **STUB**: Add `expectSelection(state: DocumentState, startLine: number, endLine: number, options?: ExpectSelectionOptions): void` to `testHelpers.ts`. Return void (no implementation yet).
- [x] **TEST**: Add test to `testHelpers.test.ts`: "expectSelection derives expected text correctly (multi-line)" - create DocumentState with content 'line1\nline2\nline3\n', call expectSelection(state, 0, 2), verify it asserts selectedText equals 'line1\nline2\nline3' (no trailing \n).
- [x] **VERIFY FAIL**: Run test command `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/testHelpers.test.js`. **Expect failure** (Red State - function not implemented).
- [x] **IMPLEMENT**: Update `expectSelection` in `testHelpers.ts` to: (1) extract smartExecute from options (default true), (2) create editor via state.createEditor(), (3) mock config, (4) call smartSelect(editor), (5) derive expected text: `lines = state.content.split('\n'); selectedLines = lines.slice(startLine, endLine + 1); expectedSelection = selectedLines.join('\n')`, (6) assert selection range and text, (7) restore config. Use try/finally for config restoration.
- [x] **VERIFY PASS**: Run test command `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/testHelpers.test.js`. **Expect pass** (Green State).
- [x] **REFACTOR**: Add test "expectSelection derives expected text correctly (single line)" - verify startLine === endLine works correctly. Add test "expectSelection with smartExecute=false" - verify config is mocked to false and single-line selection occurs. Re-run tests.
- [x] **VERIFY PASS**: Run test command `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/testHelpers.test.js`. **Expect pass** (all helper tests pass).

## Cycle 4: Refactor First Test
- [x] **STUB**: N/A (refactoring existing code).
- [x] **TEST**: N/A (existing test, refactoring implementation).
- [x] **VERIFY FAIL**: N/A (tests should pass before refactoring).
- [x] **IMPLEMENT**: Refactor test 'Function selection with decorators' in `smartSelect.test.ts` (line 28): Replace 20-line boilerplate with `const state = new DocumentState('@timer\ndef some_function(x):\n    return x\n', 1, 0); expectSelection(state, 0, 2);`. Add import: `import { DocumentState, expectSelection } from './testHelpers'`.
- [x] **VERIFY PASS**: Run test command `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/smartSelect.test.js`. **Expect pass** (Green State - refactored test works).
- [x] **REFACTOR**: Remove unused imports (MockTextDocument, MockTextEditor, getConfigSmartExecute) if only used in this test. Re-run tests.
- [x] **VERIFY PASS**: Run test command `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/smartSelect.test.js`. **Expect pass** (still working).

## Cycle 5: Refactor Remaining Tests (Batch 1)
- [x] **STUB**: N/A.
- [x] **TEST**: N/A.
- [x] **VERIFY FAIL**: N/A.
- [x] **IMPLEMENT**: Refactor tests in `smartSelect.test.ts`:
  - 'Single line selection when smart selection is disabled' (line 8): `const state = new DocumentState('x = 1', 0, 0); expectSelection(state, 0, 0, {smartExecute: false});`
  - 'Class selection with decorators' (line 50): `const state = new DocumentState('@dataclass\nclass Person:\n    name: str\n    age: int\n', 1, 0); expectSelection(state, 0, 3);`
  - 'Control flow selection (if/elif/else)' (line 72): `const state = new DocumentState('if x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")\n', 0, 0); expectSelection(state, 0, 5);`
- [x] **VERIFY PASS**: Run test command `npm run test:unit`. **Expect pass** (all refactored tests + helper tests pass).
- [x] **REFACTOR**: N/A.
- [x] **VERIFY PASS**: Run test command `npm run test:unit`. **Expect pass**.

## Cycle 6: Refactor Remaining Tests (Batch 2)
- [x] **STUB**: N/A.
- [x] **TEST**: N/A.
- [x] **VERIFY FAIL**: N/A.
- [x] **IMPLEMENT**: Refactor tests in `smartSelect.test.ts`:
  - 'Multi-line statement selection (dictionary)' (line 94): `const state = new DocumentState('data = {\n    "key1": "value1",\n    "key2": "value2",\n    "key3": "value3"\n}\n', 0, 0); expectSelection(state, 0, 4);`
  - 'Multi-block document selection (target specific function)' (line 116): `const state = new DocumentState('def first_function():\n    pass\n\n@timer\ndef target_function(x):\n    return x\n\ndef last_function():\n    pass\n', 4, 0); expectSelection(state, 3, 5);`
  - 'Edge case: empty lines and comments' (line 138): `const state = new DocumentState('def first_function():\n    pass\n\n# This is a comment\n\n@timer\ndef target_function(x):\n    return x\n\n# Another comment\n\ndef last_function():\n    pass\n', 6, 0); expectSelection(state, 5, 7);`
- [x] **VERIFY PASS**: Run test command `npm run test:unit`. **Expect pass** (all 8 refactored + 10 nested + helper tests pass = 18+ tests).
- [x] **REFACTOR**: Clean up imports in `smartSelect.test.ts` - remove MockTextDocument, MockTextEditor, getConfigSmartExecute from top-level imports (keep for nested suite if needed). Verify no unused imports.
- [x] **VERIFY PASS**: Run test command `npm run test:unit`. **Expect pass** (all 18 tests pass, clean code).

## Cycle 7: Final Verification
- [x] **STUB**: N/A.
- [x] **TEST**: N/A.
- [x] **VERIFY FAIL**: N/A.
- [x] **IMPLEMENT**: Run linting: `npm run lint`. Fix any issues. Run full test suite: `npm run test:unit`.
- [x] **VERIFY PASS**: Run test command `npm run test:unit`. **Expect pass** (all 18 tests: 8 refactored top-level + 10 nested suite tests).
- [x] **REFACTOR**: Review refactored tests for clarity. Ensure all 8 tests follow same pattern. Verify nested suite (lines 160-296) unchanged.
- [x] **VERIFY PASS**: Run test command `npm run test:unit`. **Expect pass** (final verification).

## Summary
- **Files Created**: 2 (testHelpers.ts, testHelpers.test.ts)
- **Files Modified**: 1 (smartSelect.test.ts - lines 8-158 only, nested suite unchanged)
- **Total Cycles**: 7
- **Test Command**: `npm run test:unit` (or `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/testHelpers.test.js` for specific files)
- **Expected Outcome**: All 18 tests pass (8 refactored + 10 nested), test code reduced from ~160 lines to ~30 lines, no change in behavior

## Quality Checklist
- [x] Correct template used (TDD for new test utilities)
- [x] Test command matches AGENTS.md (`npm run test:unit`)
- [x] Cycles are appropriately sized (1 logical unit per cycle)
- [x] Test files identified (testHelpers.ts, testHelpers.test.ts, smartSelect.test.ts)
- [x] Verification steps included for each cycle
- [x] Config restoration handled with try/finally
- [x] Nested suite (lines 160-296) explicitly excluded from refactoring
