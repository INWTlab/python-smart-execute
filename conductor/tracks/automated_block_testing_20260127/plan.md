# Implementation Plan - Automated Block Detection Testing

This plan outlines the steps to refactor the extension logic for testability and implement a comprehensive automated test suite based on existing interactive examples.

## Phase 1: Refactoring & Mocking Infrastructure
This phase focuses on making the current logic testable by introducing mocks for VS Code APIs.

- [ ] Task: Create a mocking utility for `vscode.TextDocument` and `vscode.TextLine` in `src/test/suite/mocks.ts`
- [ ] Task: Refactor `src/extension.ts` to ensure block detection functions are exported and don't rely on global state
- [ ] Task: Verify that the extension still compiles and lints correctly after refactoring
- [ ] Task: Conductor - User Manual Verification 'Refactoring & Mocking Infrastructure' (Protocol in workflow.md)

## Phase 2: Automated Test Suite Implementation
This phase focuses on implementing the actual tests covering all identified Python constructs.

- [ ] Task: Initialize `src/test/suite/smartSelect.test.ts` with basic test structure
- [ ] Task: Implement tests for Decorators and Function/Class definitions
- [ ] Task: Implement tests for Control Flow blocks (`if/else`, `try/except`)
- [ ] Task: Implement tests for Multi-line constructs (Comprehensions, Dictionaries, Docstrings)
- [ ] Task: Implement tests for Stepping logic (finding the next valid code line)
- [ ] Task: Verify all tests pass with `npm test`
- [ ] Task: Conductor - User Manual Verification 'Automated Test Suite Implementation' (Protocol in workflow.md)

## Phase 3: Finalization & Coverage
This phase ensures the new tests are integrated and meet quality standards.

- [ ] Task: Verify overall code coverage for `src/extension.ts`
- [ ] Task: Remove or mark `src/test/interactiveSession.py` as deprecated (or keep as a pure example)
- [ ] Task: Conductor - User Manual Verification 'Finalization & Coverage' (Protocol in workflow.md)
