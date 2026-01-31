# Implementation Plan - Automated Block Detection Testing

This plan outlines the steps to refactor the extension logic for testability and implement a
comprehensive automated test suite based on existing interactive examples.

## Phase 1: Refactoring & Mocking Infrastructure [checkpoint: 2e77a9d]

This phase focuses on making the current logic testable by introducing mocks for VS Code APIs.

- [x] Task: Create a mocking utility for `vscode.TextDocument` and `vscode.TextLine` in
      `src/test/suite/mocks.ts` [ada5562]
- [x] Task: Refactor `src/extension.ts` to ensure block detection functions are exported and don't
      rely on global state [9870c86]
- [x] Task: Verify that the extension still compiles and lints correctly after refactoring
- [x] Task: Conductor - User Manual Verification 'Refactoring & Mocking Infrastructure' (Protocol in
      workflow.md)

## Phase 2: Automated Test Suite Implementation

This phase focuses on implementing the actual tests covering all identified Python constructs.

- [x] Task: Initialize `src/test/suite/smartSelect.test.ts` with basic test structure [2e77a9d]
- [x] Task: Implement tests for Decorators and Function/Class definitions [ada5562]
- [x] Task: Implement tests for Control Flow blocks (`if/else`, `try/except`) [2e77a9d]
- [x] Task: Implement tests for Multi-line constructs (Comprehensions, Dictionaries, Docstrings)
      [ada5562]
- [x] Task: Implement tests for Stepping logic (finding the next valid code line) [2e77a9d]
- [x] Task: Verify all tests pass with `npm test` [2e77a9d]
- [ ] Task: Conductor - User Manual Verification 'Automated Test Suite Implementation' (Protocol in
      workflow.md)

## Phase 3: Finalization & Coverage

This phase ensures the new tests are integrated and meet quality standards.

- [x] Task: Install and configure coverage analysis tools [2e77a9d]
- [x] Task: Run initial coverage analysis for `src/extension.ts` [ada5562]
- [x] Task: Identify uncovered code paths [2e77a9d]
- [x] Task: Move `src/test/interactiveSession.py` to `examples/` [ada5562]
- [x] Task: Add deprecation notice to interactiveSession.py [2e77a9d]
- [x] Task: Export additional helper functions for testing [ada5562]
- [x] Task: Run final coverage analysis - **Result: 41.17% statements, 87.09% branches, 44.44% functions** [2e77a9d]
- [x] Task: Run all tests to ensure no regressions [ada5562]
- [ ] Task: Conductor - User Manual Verification 'Finalization & Coverage' (Protocol in workflow.md)
