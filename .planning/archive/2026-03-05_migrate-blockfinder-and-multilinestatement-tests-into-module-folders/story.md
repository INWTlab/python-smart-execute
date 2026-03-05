# User Story: Migrate blockFinder and multiLineStatement Tests into Module Folders

## Feature Goal
Consolidate orphaned top-level test files (`blockFinder.test.ts` and `multiLineStatement.test.ts`) into the appropriate module subfolders (`navigation/` and `smartExecute/`) using the `DocumentState`/`expectCursorPosition`/`expectSelection` helper-facility pattern. Tests that duplicate existing coverage are dropped; tests that add coverage are translated and migrated.

## Context & Motivation
The project has two test files at `src/test/suite/` root level that predate the modular test structure now established in `navigation/` and `smartExecute/`. These files use the raw `MockTextDocument` + `assert` pattern rather than the `DocumentState` helper facility. They create inconsistency in test organization and make it unclear whether behavioral coverage is actually provided by any tests, or duplicated across two test locations.

## Expected Behavior
After this story is implemented:
- `blockFinder.test.ts` and `multiLineStatement.test.ts` at the root of `src/test/suite/` are deleted
- Unique behavioral coverage from those files is preserved in tests translated to the helper-facility pattern and placed in the correct module folders
- Duplicate or no-value tests (export smoke tests, behaviors already exercised via `expectSelection`/`expectCursorPosition`) are dropped
- `npm run test:unit` continues to pass with no regressions

## Current Behavior
Two test files live outside the module subfolders and use the old direct-mock pattern. Some of their tests cover behavior already indirectly exercised through higher-level helpers; others cover important edge cases not exercised anywhere else.

## Migration Plan

### Tests to DROP (no value or already covered)

| File | Test | Reason to Drop |
|------|------|----------------|
| `blockFinder.test.ts` | `Exports should exist` | Export smoke tests add no behavioral value |
| `multiLineStatement.test.ts` | `Exports should exist` | Same |
| `multiLineStatement.test.ts` | `isOpenParenthesisLine basic` | Basic behavior exercised indirectly by multiline-statement selection tests in `selectionUtils.test.ts` |
| `multiLineStatement.test.ts` | `skipMultiLineStatement basic` | Already exercised indirectly via `expectSelection` multiline statement tests |

### Tests to MIGRATE

#### Into `src/test/suite/navigation/` — new file `blockFinder.test.ts`

These test low-level utility functions in `blockFinder.ts` that are **not** reachable via `expectCursorPosition` (the navigation helper tests `jumpNextBlock`/`jumpPreviousBlock` only, not internal building blocks). Per AGENTS.md: "Use direct-call tests (raw mock + assert): for utility functions not called by `smartSelect`".

| Source Test | Target | Translation |
|-------------|--------|-------------|
| `levelOfIndentation basic` | `navigation/blockFinder.test.ts` | Direct-call test (no `DocumentState` needed — pure string function) |
| `isBlockHeader basic` | `navigation/blockFinder.test.ts` | Direct-call test using `MockTextDocument` |
| `findNextBlockHeader should respect targetIndentLevel parameter` | `navigation/blockFinder.test.ts` | Direct-call test using `MockTextDocument` |
| `findPreviousBlockHeader should respect targetIndentLevel parameter` | `navigation/blockFinder.test.ts` | Direct-call test using `MockTextDocument` |
| `should find correct block in complex nesting scenario` | `navigation/blockFinder.test.ts` | Direct-call test using `MockTextDocument` |
| `should maintain backward compatibility without targetIndentLevel` | `navigation/blockFinder.test.ts` | Direct-call test using `MockTextDocument` |

#### Into `src/test/suite/smartExecute/` — appended to `selectionUtils.test.ts`

These test `isOpenParenthesisLine` and `isMultiLineStatementEnd` which are pure string/utility functions (like `isDecorator` already tested in `selectionUtils.test.ts`). They cannot be exercised via `expectSelection`.

| Source Test | Target | Translation |
|-------------|--------|-------------|
| `isOpenParenthesisLine with strings and comments` | `selectionUtils.test.ts` | Direct-call test (pure function, no DocumentState needed) |
| `isMultiLineStatementEnd basic` | `selectionUtils.test.ts` | Direct-call test (pure function) |

Note: `isOpenParenthesisLine` and `isMultiLineStatementEnd` live in `src/navigation/multiLineStatement.ts`, but they are most analogous to `isDecorator` which is already tested in `selectionUtils.test.ts`. Placing them there keeps all "string-predicate utility" tests together.

## Examples

### Example 1: `levelOfIndentation` — direct-call test (no DocumentState)
```typescript
// In navigation/blockFinder.test.ts
test('levelOfIndentation basic', () => {
    assert.strictEqual(bf.levelOfIndentation(''), 0);
    assert.strictEqual(bf.levelOfIndentation('    x = 1'), 4);
    assert.strictEqual(bf.levelOfIndentation('def test():'), 0);
});
```
No `DocumentState` needed — pure string function.

### Example 2: `isBlockHeader` — direct-call with MockTextDocument
```typescript
// In navigation/blockFinder.test.ts
test('isBlockHeader returns true for def, false for pass', () => {
    const doc = new MockTextDocument('def test():\n    pass\n');
    assert.strictEqual(bf.isBlockHeader(doc.lineAt(0), doc), true);
    assert.strictEqual(bf.isBlockHeader(doc.lineAt(1), doc), false);
});
```
`MockTextDocument` needed to satisfy the `vscode.TextDocument` interface; no `DocumentState` since this is a direct-call test.

### Example 3: `isOpenParenthesisLine` edge cases — direct-call in selectionUtils.test.ts
```typescript
// In smartExecute/selectionUtils.test.ts, added alongside existing isDecorator tests
test('isOpenParenthesisLine ignores brackets inside strings', () => {
    assert.strictEqual(mls.isOpenParenthesisLine('x = "text with {"'), false);
    assert.strictEqual(mls.isOpenParenthesisLine('x = { # comment with }'), true);
    assert.strictEqual(mls.isOpenParenthesisLine('# { comment only'), false);
});
```

## Acceptance Criteria
- [ ] `src/test/suite/blockFinder.test.ts` is deleted
- [ ] `src/test/suite/multiLineStatement.test.ts` is deleted
- [ ] New `src/test/suite/navigation/blockFinder.test.ts` exists with all 6 migrated tests translated to direct-call style (using `MockTextDocument` where needed, no `DocumentState`)
- [ ] `src/test/suite/smartExecute/selectionUtils.test.ts` is extended with the 2 migrated `isOpenParenthesisLine`/`isMultiLineStatementEnd` tests
- [ ] All 4 "drop" tests are not recreated anywhere
- [ ] `npm run test:unit` passes with no regressions
- [ ] No new test uses the old raw pattern where the helper facility is applicable (i.e., no test calls `smartSelect` or `jumpNextBlock`/`jumpPreviousBlock` directly without using `expectSelection`/`expectCursorPosition`)

## Technical Constraints
- The `DocumentState` helper facility is only for tests going through `smartSelect` (smartExecute) or `jumpNextBlock`/`jumpPreviousBlock` (navigation). The migrated `blockFinder` tests call internal utilities directly, so they **must** use direct-call style per AGENTS.md.
- `isOpenParenthesisLine` and `isMultiLineStatementEnd` live in `src/navigation/multiLineStatement.ts` but their tests belong in `smartExecute/selectionUtils.test.ts` alongside the analogous `isDecorator` tests, since all three are string-predicate utilities.
- The new `navigation/blockFinder.test.ts` must import from `MockTextDocument` via `'../mocks'` (same relative path used by `blockNavigator.test.ts`).

## Assumptions
- The `vscode.window.showInformationMessage` calls in the old test files are legacy noise and should not be carried over.
- Test name style should match the existing tests in the target files (sentence case, descriptive).
- `isOpenParenthesisLine` and `isMultiLineStatementEnd` are already exported from `multiLineStatement.ts` (confirmed), so tests can import them directly.

## Out of Scope
- Refactoring implementation code in `blockFinder.ts` or `multiLineStatement.ts`
- Adding new behavioral coverage beyond what exists in the source files
- Changing the test helpers facility itself

## Dependencies
None. This is a pure test reorganization with no production code changes.
