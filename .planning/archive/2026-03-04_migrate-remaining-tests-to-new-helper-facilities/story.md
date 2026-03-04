# User Story: Migrate Remaining Tests to New Helper Facilities

## Feature Goal
Consolidate the remaining unit tests that still use the old manual boilerplate pattern (direct `MockTextDocument`/`MockTextEditor` construction + manual config mocking) into the `expectSelection` and `expectCursorPosition` helper facilities established in the two most recent archive stories. This reduces test verbosity, improves consistency, and ensures the new helper pattern is the single standard across the test suite.

## Context & Motivation
The last two archived stories introduced two test helper facilities:
- `smartExecute/testHelpers.ts` — `DocumentState` + `expectSelection`
- `navigation/testHelpers.ts` — `DocumentState` (re-exported) + `expectCursorPosition`

These facilities reduce a typical test from ~15–20 lines of boilerplate to 1–2 lines. However, several test files were not migrated in those stories and still use the old pattern. A developer reading the test suite today encounters two distinct styles for testing the same kinds of behaviors, which creates inconsistency and makes new tests harder to write correctly.

## Expected Behavior
All tests that cover selection or navigation behaviors — specifically those that were candidates for the new helpers but not yet migrated — should be rewritten using `expectSelection` or `expectCursorPosition`. The old test cases are **dropped** and **replaced** (not duplicated) by equivalent new-style tests. Coverage must be fully preserved: every behavior tested in the old style must have a corresponding new-style test.

## Current Behavior
The following tests still use the old manual boilerplate pattern where migration is appropriate:

| File | Tests to migrate |
|------|-----------------|
| `smartExecute/smartSelect.test.ts` | 9 nested `Multiline Statement Selection Tests` (manual `setup`/`teardown` with `getConfigSmartExecute` mock) |
| `smartExecute/selection.test.ts` | 20 tests calling `findStartLineOfPythonCodeBlock` / `findEndLineOfPythonCodeBlock` directly → replace with `expectSelection` |
| `smartExecute/selectionUtils.test.ts` | 6 `findNextCodeLine` tests + 7 `getMultilineStatementRange` tests → replace with `expectSelection` |

The following tests are **left as-is** (already appropriately minimal or structurally necessary):
- `mocks.test.ts`, `extension.test.ts` — infrastructure/integration tests
- `blockFinder.test.ts`, `multiLineStatement.test.ts`, `execution.test.ts` — pure utility functions (no selection/cursor abstraction)
- `navigation/blockNavigator.test.ts` — 2 existing OLD-pattern tests (`Exports should exist`, `Basic navigation functions`) test structural properties, not behavior; keep them
- `selectionUtils.test.ts` — `isDecorator` and `isSelectionEmpty` tests are already minimal, keep them

## Examples

### Example 1: `smartSelect.test.ts` — Nested Multiline Suite Migration

**Before (OLD):**
```typescript
suite('Multiline Statement Selection Tests', () => {
    let originalGetConfig: typeof getConfigSmartExecute;
    setup(() => {
        originalGetConfig = getConfigSmartExecute as unknown as typeof getConfigSmartExecute;
        (getConfigSmartExecute as unknown as () => boolean) = () => true;
    });
    teardown(() => {
        (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
    });

    test('Single Line Execution Between Multiline Statements', () => {
        const content = 'my_dict = {\n    "a": 1,\n    "b": 2\n}\ny = 3\nmy_list = [\n    1,\n    2\n]';
        const doc = new MockTextDocument(content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(3, 0, 3, 0);
        const result = smartSelect(editor);
        assert.strictEqual(result.start.line, 3);
        assert.strictEqual(result.end.line, 3);
    });
    // ... 8 more tests like this
});
```

**After (NEW):**
```typescript
test('Single Line Execution Between Multiline Statements', () => {
    const state = new DocumentState('my_dict = {\n    "a": 1,\n    "b": 2\n}\ny = 3\nmy_list = [\n    1,\n    2\n]', 4, 0);
    expectSelection(state, 4, 4);
});
```

### Example 2: `selection.test.ts` — Block Boundary Tests via `expectSelection`

The internal functions `findStartLineOfPythonCodeBlock` / `findEndLineOfPythonCodeBlock` are exercised indirectly via `smartSelect`. Instead of calling them directly, the same behaviors are verified through `expectSelection`:

**Before (OLD):**
```typescript
test('Single decorator before function', () => {
    const content = '@my_decorator\ndef foo():\n    pass\n';
    const doc = new MockTextDocument(content);
    const startLine = findStartLineOfPythonCodeBlock(doc, 1);
    const endLine = findEndLineOfPythonCodeBlock(doc, 1);
    assert.strictEqual(startLine, 0);
    assert.strictEqual(endLine, 2);
});
```

**After (NEW):**
```typescript
test('Single decorator before function', () => {
    const state = new DocumentState('@my_decorator\ndef foo():\n    pass\n', 1, 0);
    expectSelection(state, 0, 2);
});
```

### Example 3: `selectionUtils.test.ts` — `getMultilineStatementRange` via `expectSelection`

**Before (OLD):**
```typescript
test('Cursor on opening line', () => {
    const content = 'my_tuple = (\n    1,\n    2,\n    3\n)';
    const doc = new MockTextDocument(content);
    const result = getMultilineStatementRange(doc, 0);
    assert.strictEqual(result?.start, 0);
    assert.strictEqual(result?.end, 4);
});
```

**After (NEW):**
```typescript
test('Cursor on opening line', () => {
    const state = new DocumentState('my_tuple = (\n    1,\n    2,\n    3\n)', 0, 0);
    expectSelection(state, 0, 4);
});
```

## Acceptance Criteria
- [ ] **`smartSelect.test.ts`**: The 9 tests in the nested `Multiline Statement Selection Tests` suite are rewritten using `expectSelection`. The `setup`/`teardown` boilerplate and manual mock wiring are removed. The nested `suite()` wrapper may be kept or collapsed into the top-level suite at author's discretion.
- [ ] **`selection.test.ts`**: All 20 tests are replaced by equivalent `expectSelection` calls. The file no longer imports `findStartLineOfPythonCodeBlock` or `findEndLineOfPythonCodeBlock` directly. Coverage of all tested scenarios (decorators, classes, control flow, multi-line constructs) is preserved.
- [ ] **`selectionUtils.test.ts`**: The 6 `findNextCodeLine` tests and 7 `getMultilineStatementRange` tests are replaced by equivalent `expectSelection` calls. The `isDecorator` and `isSelectionEmpty` tests are left unchanged.
- [ ] **No coverage loss**: Every behavior scenario tested in the old files has a corresponding test in the new style. A line-by-line comparison of old vs new test cases confirms none are dropped.
- [ ] **All unit tests pass**: `npm run test:unit` passes with zero failures after migration.
- [ ] **No new helper functions introduced**: Migration uses only the existing `DocumentState` + `expectSelection` facility. No new abstractions are created.
- [ ] **Unchanged files**: `mocks.test.ts`, `extension.test.ts`, `blockFinder.test.ts`, `multiLineStatement.test.ts`, `execution.test.ts`, and the `isDecorator`/`isSelectionEmpty` tests in `selectionUtils.test.ts` are not modified.

## Technical Constraints
- `expectSelection` calls `smartSelect` end-to-end. Tests that previously called internal functions directly (`findStartLineOfPythonCodeBlock`, `findEndLineOfPythonCodeBlock`, `findNextCodeLine`, `getMultilineStatementRange`) will now exercise the full selection pipeline. Any scenario where the internal function and `smartSelect` behave differently for the same cursor position needs careful review to ensure the replacement test genuinely covers the intended behavior.
- `selectionUtils.test.ts` `findNextCodeLine` tests do not involve selection ranges — `findNextCodeLine` determines where the cursor steps after execution, not what gets selected. These tests may not be directly replaceable with `expectSelection` without introducing new helper coverage. This should be resolved during implementation by examining whether `expectSelection` naturally covers these scenarios.

## Assumptions
- The `expectSelection` helper accurately covers all scenarios previously tested via direct internal function calls — i.e., the behaviors of `findStartLineOfPythonCodeBlock`, `findEndLineOfPythonCodeBlock`, and `getMultilineStatementRange` are fully observable through `smartSelect`'s output.
- The `findNextCodeLine` function's behavior is tested indirectly through `smartSelect` scenarios that involve skipping decorators/comments when finding the next code line after a block.
- No new test helpers or abstractions are needed; the existing facilities are sufficient.

## Out of Scope
- Creating any new helper functions or extending `testHelpers.ts`
- Migrating `mocks.test.ts`, `extension.test.ts`, `blockFinder.test.ts`, `multiLineStatement.test.ts`, or `execution.test.ts`
- Migrating the 2 structural tests in `blockNavigator.test.ts` (`Exports should exist`, `Basic navigation functions`)
- Any changes to production code (`selection.ts`, `selectionUtils.ts`, etc.)

## Dependencies
- Depends on: `2026-03-03_test-refactoring-documentstate-and-expectselection-facility` (provides `DocumentState` + `expectSelection`) — **complete**
- Depends on: `2026-03-04_navigation-test-helper-facility` (provides `expectCursorPosition`) — **complete**
- Blocks: nothing (pure test refactoring)

---

> **Note on `findNextCodeLine` tests**: There is one open question. The 6 `findNextCodeLine` tests in `selectionUtils.test.ts` test a utility that determines the *next code line to step to after execution* — this is not a selection boundary function. `expectSelection` tests what gets *selected*, not what cursor position is stepped to. These tests may not be directly replaceable with `expectSelection` without introducing new helper coverage. This should be investigated at the start of implementation to decide: migrate via `expectSelection` where coverage naturally aligns, or leave those 6 tests in old-style since they test a distinct concern.
