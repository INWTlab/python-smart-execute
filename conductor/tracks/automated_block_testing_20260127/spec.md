# Track Specification: Automated Block Detection Testing

## Overview
This track aims to replace manual interactive testing of the "Smart Execute" block detection logic with a robust suite of automated unit tests. We will refactor the core logic to support mocking of VS Code dependencies and implement test cases based on the existing `interactiveSession.py` examples.

## Functional Requirements
- **Refactor for Testability:** Modify the block detection functions in `src/extension.ts` to allow for dependency injection or use of mock objects for `vscode.TextDocument`, `vscode.TextLine`, and `vscode.Selection`.
- **Implement Automated Test Suite:** Create `src/test/suite/smartSelect.test.ts` to host the new tests.
- **Coverage of Python Constructs:** The test suite must validate correct block identification for:
    - **Decorators:** Single and multiple decorators before functions/classes.
    - **Control Flow:** `if/elif/else` and `try/except/finally` blocks, including nested structures.
    - **Functions & Classes:** Multi-line signatures, docstrings, and method definitions.
    - **Blocks & Statements:** `with` statements, `for` loops, and multi-line dictionaries/list comprehensions.
- **Stepping Logic:** Verify that the "step" functionality correctly identifies the next valid code line after a block execution.

## Non-Functional Requirements
- **Mocking Strategy:** Use mock objects to simulate the VS Code environment, avoiding the need for a full extension host for every unit test where possible (though tests will still run via `@vscode/test-electron`).
- **Code Coverage:** Aim for high coverage (>80%) of the logic responsible for selecting start/end lines of blocks.
- **Performance:** Ensure the test suite runs quickly within the existing Mocha/Node.js environment.

## Acceptance Criteria
- `npm test` runs the new automated suite and all tests pass.
- Every scenario currently manually tested in `src/test/interactiveSession.py` is covered by at least one automated test.
- The refactoring does not change the observable behavior of the extension for the end-user.

## Out of Scope
- Changes to the actual terminal communication or REPL management logic.
- Redesigning the existing regex-based detection (refactoring is for testability, not logic replacement).
