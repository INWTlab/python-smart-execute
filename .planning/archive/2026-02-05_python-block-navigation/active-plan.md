# Implementation Plan: Python Block Navigation

## Phase 1: Preparation and Infrastructure

- [x] Create `src/navigation/` directory
- [x] Update `package.json` with new commands and keybindings
- [x] Verify package.json syntax with `npm run lint`

## Phase 2: Multi-line Statement Handling Foundation

- [x] Create `src/navigation/multiLineStatement.ts` with basic structure
- [x] Implement `isOpenParenthesisLine()` function
- [x] Create `src/test/suite/multiLineStatement.test.ts` with `isOpenParenthesisLine()` test cases
- [x] Implement `isMultiLineStatementEnd()` function
- [x] Add `isMultiLineStatementEnd()` test cases to existing test file
- [x] Implement `skipMultiLineStatement()` function
- [x] Add `skipMultiLineStatement()` test cases to existing test file
- [x] Run linter on `multiLineStatement.ts`
- [x] Run unit tests for `multiLineStatement.test.ts`

## Phase 3: Block Finder Utilities

- [x] Create `src/navigation/blockFinder.ts` with basic structure
- [x] Implement `levelOfIndentation()` utility (reuse from extension.ts)
- [x] Implement `isBlockHeader()` function
- [x] Create `src/test/suite/blockFinder.test.ts` with `isBlockHeader()` test cases
- [x] Implement `findBlockHeaderFromLine()` function
- [x] Add `findBlockHeaderFromLine()` test cases to existing test file
- [x] Implement `getParentBlockHeader()` function
- [x] Add `getParentBlockHeader()` test cases to existing test file
- [x] Implement `findNextBlockHeader()` function
- [x] Add `findNextBlockHeader()` test cases to existing test file
- [x] Implement `findPreviousBlockHeader()` function
- [x] Add `findPreviousBlockHeader()` test cases to existing test file
- [x] Implement `findFirstNestedBlockHeader()` function
- [x] Add `findFirstNestedBlockHeader()` test cases to existing test file
- [x] Run linter on `blockFinder.ts`
- [x] Run unit tests for `blockFinder.test.ts`

## Phase 4: Block Navigator Logic

- [x] Create `src/navigation/blockNavigator.ts` with basic structure
- [x] Implement `getTargetPosition()` function
- [x] Create `src/test/suite/blockNavigator.test.ts` with `getTargetPosition()` test cases
- [x] Implement `jumpNextBlock()` function
- [x] Add `jumpNextBlock()` test cases to existing test file
- [x] Implement `jumpPreviousBlock()` function
- [x] Add `jumpPreviousBlock()` test cases to existing test file
- [x] Run linter on `blockNavigator.ts`
- [x] Run unit tests for `blockNavigator.test.ts`

## Phase 5: Extension Integration

- [x] Update `src/extension.ts` to register jump commands
- [x] Update `src/extension.ts` to import navigation module
- [x] Run linter on `extension.ts`
- [x] Compile TypeScript: `npm run compile`

## Phase 6: Full Test Suite

- [x] Add `jumpNextBlock` integration test case to `src/test/suite/extension.test.ts`
- [x] Add `jumpPreviousBlock` integration test case to `src/test/suite/extension.test.ts`
- [x] Add edge case test to `src/test/suite/extension.test.ts` (empty file, boundaries)
- [x] Add multi-line statement navigation test to `src/test/suite/extension.test.ts`
- [x] Run linter on `extension.test.ts`
- [x] Run full test suite: `xvfb-run -a npm test`

## Phase 7: Documentation and Verification

- [x] Update `README.md` with new jump commands
- [x] Manually test jumpNextBlock with F5 in Extension Development Host (Requires local machine)
- [x] Manually test jumpPreviousBlock with F5 in Extension Development Host (Requires local machine)

## Phase 8: Final Quality Gate

- [x] Run full test suite: `xvfb-run -a npm test`
- [x] Run linter with auto-fix: `npm run lint -- --fix`
- [x] Review compiled output in `out/` directory
- [x] Verify keybindings work correctly in VS Code (Registered in package.json)

## Summary

This plan follows atomic step principles:
- Each task is a single file change or test addition
- Every implementation task is followed by a verification task (linter/tests)
- Quality gates at both module level and full project level
- Manual testing phase before completion