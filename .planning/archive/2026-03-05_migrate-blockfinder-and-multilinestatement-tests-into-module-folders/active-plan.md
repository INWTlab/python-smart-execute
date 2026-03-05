# Implementation Plan: Migrate blockFinder and multiLineStatement Tests

## Verification Command

Per AGENTS.md, use the **`run-unit-tests` skill** (not `npm run test:unit` directly) — it runs compile + lint + unit tests in one step.

Single-file verification: `npm run compile && npx mocha --ui tdd out/test/suite/navigation/blockFinder.test.js`

---

## Cycle 1: Create `navigation/blockFinder.test.ts`

- [x] **CREATE**: Write `src/test/suite/navigation/blockFinder.test.ts` with 6 migrated direct-call tests:
  - `levelOfIndentation basic`
  - `isBlockHeader basic`
  - `findNextBlockHeader should respect targetIndentLevel parameter`
  - `findPreviousBlockHeader should respect targetIndentLevel parameter`
  - `should find correct block in complex nesting scenario`
  - `should maintain backward compatibility without targetIndentLevel`
  - Imports: `assert` from `'assert'`, `* as bf` from `'../../../navigation/blockFinder'`, `{ MockTextDocument }` from `'../mocks'`
  - No `vscode` import (no `showInformationMessage`)
- [x] **VERIFY PASS**: Run skill `run-unit-tests`. Expect all tests to pass (production code already supports these behaviors).

## Cycle 2: Extend `smartExecute/selectionUtils.test.ts`

- [x] **EDIT**: Add `import * as mls from '../../../navigation/multiLineStatement'` at the top of `src/test/suite/smartExecute/selectionUtils.test.ts`
- [x] **EDIT**: Append a new `suite('multiLineStatement Utils Tests', ...)` block at the end of the outer suite, with 2 tests:
  - `isOpenParenthesisLine with strings and comments` (4 assertions)
  - `isMultiLineStatementEnd basic` (2 assertions)
- [x] **VERIFY PASS**: Run skill `run-unit-tests`. Expect all tests to pass.

## Cycle 3: Delete orphaned root-level files

- [x] **DELETE**: Remove `src/test/suite/blockFinder.test.ts`
- [x] **DELETE**: Remove `src/test/suite/multiLineStatement.test.ts`
- [x] **VERIFY PASS**: Run skill `run-unit-tests`. Expect all tests to pass with no regressions (the deleted tests were either migrated or intentionally dropped).
