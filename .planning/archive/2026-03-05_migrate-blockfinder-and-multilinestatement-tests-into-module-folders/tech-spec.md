# Technical Specification: Migrate blockFinder and multiLineStatement Tests into Module Folders

## 1. Files to Modify

- `src/test/suite/smartExecute/selectionUtils.test.ts`: Append two migrated test cases from `multiLineStatement.test.ts`
  - **Current behavior:** Contains tests for `isDecorator`, `findNextCodeLine`, `isSelectionEmpty`, and `getMultilineStatementRange`
  - **New behavior:** Additionally covers `isOpenParenthesisLine` (strings/comments variant) and `isMultiLineStatementEnd`
  - **Functions/sections affected:** Top-level `suite('Selection Utils Test Suite', ...)` — new import added and two direct-call tests appended in a new sub-suite

## 2. Files to Create

- `src/test/suite/navigation/blockFinder.test.ts`: New module-colocated test file for `blockFinder.ts` utilities
  - Migrates 6 behavioral tests from the orphaned root-level `blockFinder.test.ts`
  - Uses direct-call style with `MockTextDocument` (same pattern as `blockNavigator.test.ts`)

## 3. Files to Delete

- `src/test/suite/blockFinder.test.ts`: Orphaned root-level file — all kept tests migrated to new location, `Exports should exist` dropped
- `src/test/suite/multiLineStatement.test.ts`: Orphaned root-level file — 2 tests migrated to `selectionUtils.test.ts`, 3 others dropped

## 4. Implementation Approach

### What to Implement

**A. New file: `navigation/blockFinder.test.ts`**

- **Location:** `src/test/suite/navigation/blockFinder.test.ts`
- **Approach:** Mirror the structure of `blockNavigator.test.ts` — import from `'../../../navigation/blockFinder'` and `'../mocks'` (relative paths matching the module folder depth). Use `suite` / `test` Mocha TDD structure. No `expectCursorPosition` helper needed since these are pure utility functions not reachable through high-level helpers.
- **Tools/Utilities:** `MockTextDocument` from `'../mocks'`, `assert` from `'assert'`; no `vscode` import needed (no `vscode.window.showInformationMessage` — legacy noise to omit)
- **Tests to include (6 tests migrated from root `blockFinder.test.ts`):**
  1. `levelOfIndentation basic` — 4 assertions on empty string, 4-space indented, 0-indent def, 4-space nested def
  2. `isBlockHeader basic` — `MockTextDocument` with `'def test():\n    pass\n'`, asserts true for line 0 and false for line 1
  3. `findNextBlockHeader should respect targetIndentLevel parameter` — nested `def outer/inner1/inner2` doc, call `findNextBlockHeader(doc, 1, 4)`, expect `lineNumber === 4`
  4. `findPreviousBlockHeader should respect targetIndentLevel parameter` — same content, call `findPreviousBlockHeader(doc, 4, 4)`, expect `lineNumber === 1`
  5. `should find correct block in complex nesting scenario` — `class Outer / inner_method` doc, call `findNextBlockHeader(doc, 5, 4)`, expect `undefined`
  6. `should maintain backward compatibility without targetIndentLevel` — `def func1/func2` doc, call `findNextBlockHeader(doc, 0)` (no third arg), expect `lineNumber === 3`
- **Tests to drop:** `Exports should exist` — no behavioral value

**B. Extend `smartExecute/selectionUtils.test.ts`**

- **Location:** `src/test/suite/smartExecute/selectionUtils.test.ts`
- **Approach:** Add one new import (`import * as mls from '../../../navigation/multiLineStatement'`) at the top of the file. Append a new nested `suite('multiLineStatement Utils Tests', ...)` block at the end of the outer suite, containing 2 direct-call tests. No changes to existing tests.
- **Tools/Utilities:** `MockTextDocument` (already imported), `assert` (already imported); add `mls` import
- **Tests to include (2 tests migrated from root `multiLineStatement.test.ts`):**
  1. `isOpenParenthesisLine with strings and comments` — 4 assertions: bracket inside string → `false`, balanced array with trailing comment → `false`, open bracket before inline comment → `true`, comment-only line → `false`
  2. `isMultiLineStatementEnd basic` — 2 assertions: `'x = 1'` → `true`, `'x = {'` → `false`
- **Tests to drop (from `multiLineStatement.test.ts`):**
  - `Exports should exist` — no behavioral value
  - `isOpenParenthesisLine basic` — already covered indirectly by existing `getMultilineStatementRange` tests
  - `skipMultiLineStatement basic` — already covered indirectly

**C. Delete orphaned root-level files**

- `src/test/suite/blockFinder.test.ts` — delete after creating `navigation/blockFinder.test.ts`
- `src/test/suite/multiLineStatement.test.ts` — delete after extending `selectionUtils.test.ts`

### External Dependencies

**Decision: Build vs Buy**
- [x] No new external dependencies needed — pure test reorganization

## 5. Test Strategy

### What to Test

1. **`levelOfIndentation basic`**
   - **What:** `blockFinder.levelOfIndentation` returns correct indent counts
   - **Given:** String inputs of varying leading whitespace
   - **When:** Called with `''`, `'    x = 1'`, `'def test():'`, `'    def nested():'`
   - **Then:** Returns `0`, `4`, `0`, `4` respectively

2. **`isBlockHeader basic`**
   - **What:** `isBlockHeader` correctly identifies block header lines vs body lines
   - **Given:** `MockTextDocument` with `'def test():\n    pass\n'`
   - **When:** Called with line 0 (`def test():`) and line 1 (`    pass`)
   - **Then:** Returns `true` for line 0, `false` for line 1

3. **`findNextBlockHeader should respect targetIndentLevel parameter`**
   - **What:** Next block search filters results to the specified indent level
   - **Given:** Document with `outer / inner1 / inner2` nesting
   - **When:** `findNextBlockHeader(doc, 1, 4)` — start at `inner1`, look forward for indent-4
   - **Then:** Returns the line for `inner2` (line 4), with indentation 4
   - **Edge cases:** Does not return `outer` (indent 0) or deeply nested lines (indent 8)

4. **`findPreviousBlockHeader should respect targetIndentLevel parameter`**
   - **What:** Previous block search filters results to the specified indent level
   - **Given:** Same nested document
   - **When:** `findPreviousBlockHeader(doc, 4, 4)` — start at `inner2`, look backward for indent-4
   - **Then:** Returns the line for `inner1` (line 1), with indentation 4

5. **`should find correct block in complex nesting scenario`**
   - **What:** Returns `undefined` when no further sibling exists at the target indent
   - **Given:** `class Outer / inner_method` document
   - **When:** `findNextBlockHeader(doc, 5, 4)` — from `inner_method` at line 5, look forward for indent-4
   - **Then:** Returns `undefined`

6. **`should maintain backward compatibility without targetIndentLevel`**
   - **What:** Omitting the third argument preserves original search-any-block behavior
   - **Given:** `def func1 / def func2` at indent 0
   - **When:** `findNextBlockHeader(doc, 0)` — no `targetIndentLevel`
   - **Then:** Returns `func2` at line 3

7. **`isOpenParenthesisLine with strings and comments`**
   - **What:** Brackets inside string literals or comments do not affect parenthesis balance
   - **Given:** Various string inputs
   - **When:** Called with string-containing-bracket, balanced-array-with-trailing-comment, open-bracket-before-inline-comment, comment-only
   - **Then:** Returns `false`, `false`, `true`, `false` respectively

8. **`isMultiLineStatementEnd basic`**
   - **What:** A non-empty, non-opening-bracket line is a valid multi-line statement end
   - **Given:** `'x = 1'` and `'x = {'`
   - **When:** `isMultiLineStatementEnd` called on each
   - **Then:** Returns `true` and `false` respectively

### Test Files

- `src/test/suite/navigation/blockFinder.test.ts` *(new)*:
  - Suite: `Block Finder Test Suite`
  - Test cases: 6 (listed above; `Exports should exist` dropped)

- `src/test/suite/smartExecute/selectionUtils.test.ts` *(extended)*:
  - Suite to add: `multiLineStatement Utils Tests` (nested within outer suite)
  - Test cases to add: `isOpenParenthesisLine with strings and comments`, `isMultiLineStatementEnd basic`
  - New import to add: `import * as mls from '../../../navigation/multiLineStatement'`

## 6. Design Decisions

- **Drop `Exports should exist` tests**: These assert that named exports exist (e.g., `assert.ok(bf.levelOfIndentation)`). They provide no behavioral signal — if an export is removed, a compilation error in the behavioral tests catches it first. Consistent with the story's explicit instruction.
  - Alternatives considered: keeping as quick sanity checks
  - Trade-offs: Keeping adds noise with no coverage gain; dropping is safe because TypeScript compilation enforces export presence

- **Direct-call style for `blockFinder.test.ts`**: Functions under test (`levelOfIndentation`, `isBlockHeader`, `findNextBlockHeader`, `findPreviousBlockHeader`) are not reachable through `jumpNextBlock`/`jumpPreviousBlock` in a way that isolates each function. Per AGENTS.md: "Use direct-call tests for utility functions not called by `smartSelect`."
  - Alternatives considered: using `expectCursorPosition` helper — rejected because it goes through `getTargetPosition` → `blockNavigator`, obscuring which function is exercised

- **Nest migrated MLS tests in a sub-suite**: Uses a `suite('multiLineStatement Utils Tests', ...)` block inside `selectionUtils.test.ts` rather than flat top-level tests, consistent with the existing `suite('findNextCodeLine Tests', ...)` and `suite('getMultilineStatementRange Tests', ...)` pattern already in that file.
  - Alternatives considered: flat top-level tests — rejected for inconsistency with existing file structure

- **No `vscode.window.showInformationMessage` in new files**: The two orphaned files call this. It's legacy noise with no test purpose; no other current test files use it.

- **Import path for `mls` in `selectionUtils.test.ts`**: `'../../../navigation/multiLineStatement'` navigates up from `src/test/suite/smartExecute/` to `src/`, then down to `navigation/multiLineStatement`. Consistent with how `selection.ts` is imported in the same file: `'../../../smartExecute/selection'`.
