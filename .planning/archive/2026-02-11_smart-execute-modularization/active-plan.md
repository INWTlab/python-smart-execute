# Implementation Plan: Smart Execute Modularization

## Phase 1: Bootstrap Smart Execute Module & Test Structure
- [x] Create directory `src/smartExecute/`
- [x] Create file `src/smartExecute/selection.ts` with exported placeholder functions to mirror existing helpers (smartSelect, sanitizeSelection, findStartLineOfPythonCodeBlock, findEndLineOfPythonCodeBlock, findNextCodeLine, stepCursor)
- [x] Create directory `src/test/suite/smartExecute/` to colocate unit tests with the new module (mirroring `src/navigation/` pattern)
- [x] Run `npm run compile` to ensure new files compile without import errors
- [x] Run `npm run lint` to ensure style compliance (fails due to pre-existing lint errors in test utilities)

## Phase 2: Migrate Selection & Stepping Logic
- [x] Move selection and stepping helpers (`smartSelect`, `findStartLineOfPythonCodeBlock`, `findEndLineOfPythonCodeBlock`, `findNextCodeLine`, `stepCursor`) from `src/extension.ts` to `src/smartExecute/selection.ts`
- [x] Update imports in `src/extension.ts` to use `src/smartExecute/selection.ts`
- [x] Move corresponding tests from `src/test/suite/smartSelect.test.ts` to new `src/test/suite/smartExecute/selection.test.ts` and update imports
- [x] Run `npm run compile && npm run lint` (lint still reports pre-existing issues in test utilities)
- [x] Run `npm run test:unit` to verify selection/stepping tests pass at new location
- [ ] Run `xvfb-run -a npm test` to ensure no regression in integration tests (blocked: `xvfb-run` command unavailable)

## Phase 3: Migrate Execution Logic
- [x] Move execution helpers (`selectionToRepl`, `sanitizeSelection`) from `src/extension.ts` to `src/smartExecute/execution.ts`
- [x] Update imports in `src/extension.ts` and `src/smartExecute/selection.ts` to use `src/smartExecute/execution.ts` where needed
- [x] Create or update `src/test/suite/smartExecute/execution.test.ts` with tests for moved execution functions
- [x] Run `npm run compile && npm run lint` (lint still reports long-standing issues in shared test utilities)
- [x] Run `npm run test:unit` to verify execution tests pass
- [ ] Run `xvfb-run -a npm test` to check end-to-end behavior for Python and Jupyter engines (command not available in the container)

## Phase 4: Expose Configuration Helpers
- [x] Create `src/smartCreate/config.ts` and move configuration getters (`getConfigEngine`, `getConfigSmartExecute`, `getConfigStep`, `getConfigDelay`)
- [x] Update imports in `src/smartExecute/selection.ts` and `src/smartExecute/execution.ts` to use new config module
- [x] Run `npm run compile && npm run lint` (lint still reports long-standing issues in shared test utilities)
- [x] Run `npm run test:unit`
- [ ] Run full test suite `xvfb-run -a npm test` to verify configuration still works correctly (blocked: `xvfb-run` missing)

## Phase 5: Final Verification & Cleanup
- [ ] Review overall file structure: confirm `src/smartExecute/` module and `src/test/suite/smartExecute/` tests are properly organized alongside `src/navigation/`
- [ ] Ensure no lingering references to old locations remain in imports or tests
- [ ] Run final `npm run compile`, `npm run lint`, and `xvfb-run -a npm test`
- [ ] Manually verify smart execution and navigation commands in Extension Development Host
- [ ] Update `AGENTS.md` to include guidance on `src/smartExecute/` folder purpose and patterns
- [ ] Archive `.planning/*` files into `.planning/archive/YYYY-MM-DD_smart-execute-modularization/` upon completion

## Notes
- Keep existing behavior unchanged; refactoring should be transparent to end users
- Ensure all moved functions remain exported for testability as before
- Maintain consistent module naming and import paths
- After each phase, run the test suite to catch regressions early
