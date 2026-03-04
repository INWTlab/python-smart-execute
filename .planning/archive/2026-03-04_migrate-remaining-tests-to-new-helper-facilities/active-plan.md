# TDD Implementation Plan: Migrate Tests to New Helper Facilities

## Overview
Pure test refactoring. No production code changes. Three files are migrated from old-style (direct mock/assert boilerplate) to `DocumentState` + `expectSelection`. Order follows the spec recommendation: smallest change first.

Test command (via skill): `run-unit-tests` skill (compiles, lints, and runs `npm run test:unit`)

---

## Cycle 1: `selectionUtils.test.ts` — Replace `getMultilineStatementRange` suite

- [x] **IMPLEMENT**: In `src/test/suite/smartExecute/selectionUtils.test.ts`:
  - Remove `getMultilineStatementRange` from the import on line 6.
  - Add `import { DocumentState, expectSelection } from './testHelpers';` after line 9.
  - Replace lines 88–163 (the `getMultilineStatementRange Tests` suite body) with 7 new `expectSelection`-based tests per the spec table.
- [x] **VERIFY PASS**: Load the `run-unit-tests` skill and run. **Expect all tests pass.**
- [x] **REFACTOR**: Review new suite body for consistency (naming, formatting). Re-run tests.
- [x] **VERIFY PASS**: Run `run-unit-tests` skill. **Expect all tests pass.**

---

## Cycle 2: `selection.test.ts` — Full rewrite

- [x] **IMPLEMENT**: Rewrite `src/test/suite/smartExecute/selection.test.ts` from scratch:
  - Single import: `import { DocumentState, expectSelection } from './testHelpers';`
  - Suite name: `'Smart Select Logic Test Suite'`
  - Five sub-suites (Decorator Tests, Function Definition Tests, Class Definition Tests, Control Flow Tests, Multi-line Construct Tests)
  - 16 `expectSelection`-based tests per the spec migration table.
  - Drop `'Exports should exist'` test and `'Multi-line docstring in class'` duplicate.
- [x] **VERIFY PASS**: Load the `run-unit-tests` skill and run. **Expect all tests pass.**
- [x] **REFACTOR**: Review for any inconsistencies in test naming or content strings vs. spec. Re-run tests.
- [x] **VERIFY PASS**: Run `run-unit-tests` skill. **Expect all tests pass.**

---

## Cycle 3: `smartSelect.test.ts` — Remove nested suite boilerplate

- [x] **IMPLEMENT**: In `src/test/suite/smartExecute/smartSelect.test.ts`:
  - Remove imports no longer needed: `assert`, `vscode`, `smartSelect`, `MockTextDocument`, `MockTextEditor`, `getConfigSmartExecute` (lines 1–5).
  - Remove the nested `suite('Multiline Statement Selection Tests', ...)` block including `setup`/`teardown` (lines 44–180).
  - Add 9 new `expectSelection`-based tests inside the top-level suite (optionally wrapped in `suite('Multiline Statement Selection Tests', () => { ... })` without `setup`/`teardown`).
  - Preserve the 7 existing NEW-style tests at the top of the suite unchanged.
- [x] **VERIFY PASS**: Load the `run-unit-tests` skill and run. **Expect all tests pass.**
- [x] **REFACTOR**: Confirm no trailing semicolon at end of file (line 181 currently has `;;`). Re-run tests.
- [x] **VERIFY PASS**: Run `run-unit-tests` skill. **Expect all tests pass.**
