# TDD Implementation Plan: Navigation Test Helper Facility

## Overview
Create `src/test/suite/navigation/testHelpers.ts` mirroring the smartExecute helper
pattern, then refactor all 9 tests in `blockNavigator.test.ts` to use it.

Test command: `npm run compile && npm run lint && npm run test:unit`

---

## Cycle 1: `expectCursorPosition` helper stub + testHelpers.test.ts

- [x] **STUB**: Create `src/test/suite/navigation/testHelpers.ts`
      - Re-export `DocumentState` from `../smartExecute/testHelpers`
      - Export `ExpectCursorPositionOptions { character?: number }` interface
      - Export `expectCursorPosition(state, direction, expectedLine, options?)` that
        returns immediately without asserting (stub body)

- [x] **TEST**: Create `src/test/suite/navigation/testHelpers.test.ts` with suite
      "Navigation Test Helpers Test Suite" containing 9 tests:
      1. DocumentState is re-exported
      2. numeric `expectedLine` with direction 'next'
      3. numeric `expectedLine` with direction 'previous'
      4. `'first-line'` resolves to line 0
      5. `'last-line'` resolves to doc.lineCount - 1
      6. single-line doc: 'first-line' and 'last-line' both resolve to 0
      7. `options.character` is asserted when provided
      8. default character is 0 when not provided
      9. throws AssertionError on wrong expected line

- [x] **VERIFY FAIL**: Run test command. **Expect failure** (stub doesn't assert).

- [x] **IMPLEMENT**: Replace stub body with real logic:
      - Create `MockTextDocument` from `state`
      - Resolve `'first-line'` → 0, `'last-line'` → `doc.lineCount - 1`
      - Call `jumpNextBlock(doc, pos)` or `jumpPreviousBlock(doc, pos)`
      - `assert.strictEqual(result.line, resolvedLine)`
      - `assert.strictEqual(result.character, options?.character ?? 0)`

- [x] **VERIFY PASS**: Run test command. **Expect pass**.

- [x] **REFACTOR**: Review for clarity/duplication. Re-run tests.

- [x] **VERIFY PASS**: Run test command. **Expect pass**.

---

## Cycle 2: Move & refactor `blockNavigator.test.ts`

- [x] **STUB** (prep): Move `src/test/suite/blockNavigator.test.ts` →
      `src/test/suite/navigation/blockNavigator.test.ts`.
      Update import paths (`../../navigation/blockNavigator` → `../../../navigation/blockNavigator`,
      `./mocks` → `../mocks`). Confirm tests still pass (no behavior change yet).

- [x] **VERIFY PASS**: Run test command. **Expect pass** (same tests, new location).

- [x] **IMPLEMENT**: Refactor each of the 9 tests to use `expectCursorPosition`:
      - Test 1 ("Exports should exist") — keep as-is (export check, not navigation)
      - Test 2 ("Basic navigation functions") — keep as-is (two-direction smoke test)
      - Tests 3–8 — replace ~15 lines each with 1–2 `expectCursorPosition` calls

- [x] **VERIFY PASS**: Run test command. **Expect pass**.

- [x] **REFACTOR**: Clean up imports (remove unused `MockTextDocument` if no longer
      needed directly, remove unused `vscode` import if applicable). Re-run tests.

- [x] **VERIFY PASS**: Run test command. **Expect pass**.
