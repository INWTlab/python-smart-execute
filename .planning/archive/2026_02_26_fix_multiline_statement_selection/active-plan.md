# TDD Implementation Plan

## Cycle 1: Fix Multiline Statement Selection in Control Flow Blocks
- [x] **STUB**: Update `src/smartExecute/selection.ts` with the new logic for `findEndLineOfPythonCodeBlock`. Since this is an existing function, we will directly implement the fix instead of a stub, as the current behavior is already "stubbed" with the bug.
- [x] **TEST**: Create a unit test in `src/test/suite/smartExecute/smartSelect.test.ts` asserting the *real* expected behavior for a multiline statement inside an `if` block.
- [x] **VERIFY FAIL**: Run test command `npm run test:unit`. **Expect failure** (Red State).
- [x] **IMPLEMENT**: Update `src/smartExecute/selection.ts` to replace the buggy logic with the correct logic.
- [x] **VERIFY PASS**: Run test command `npm run test:unit`. **Expect pass** (Green State).
- [x] **REFACTOR**: Improve `src/smartExecute/selection.ts` for readability, performance, or maintainability **without changing behavior**. Re-run tests to ensure they still pass.
- [x] **VERIFY PASS**: Run test command `npm run test:unit` post-refactor. **Expect pass** (Refactored State).