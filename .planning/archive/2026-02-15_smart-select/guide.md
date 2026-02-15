# User Guide: SmartSelect Behavior Tests

## Feature Goal
The goal of this feature is to **create behavior-driven tests** for the `smartSelect` function in the Python Smart Execute extension. These tests will:

1. Verify the **end-to-end behavior** of `smartSelect` from the user's perspective (e.g., "When I press `Ctrl+Enter`, the correct code block is selected").
2. Decouple tests from implementation details to make them **more resilient** to refactoring.
3. Enhance the existing mocks to better simulate the VS Code API and edge cases.
4. Refactor existing tests to focus on **utility functions** (e.g., `isDecorator`, `findNextCodeLine`) separately from behavior tests.


## Workflow & Examples

### 1. **Test `smartSelect` Behavior**
The `smartSelect` function is the core of the extension's behavior. It should be tested for the following scenarios:

#### Example 1: Single Line Selection
- **Scenario**: `getConfigSmartExecute()` is `false`.
- **Action**: The user presses `Ctrl+Enter` on a line of code.
- **Expected Result**: Only the current line is selected.

#### Example 2: Function Selection
- **Scenario**: The cursor is inside a function definition.
- **Action**: The user presses `Ctrl+Enter`.
- **Expected Result**: The entire function, including decorators, is selected.

#### Example 3: Class Selection
- **Scenario**: The cursor is inside a class definition.
- **Action**: The user presses `Ctrl+Enter`.
- **Expected Result**: The entire class, including decorators, is selected.

#### Example 4: Control Flow Selection
- **Scenario**: The cursor is inside an `if/elif/else` block.
- **Action**: The user presses `Ctrl+Enter`.
- **Expected Result**: The entire `if/elif/else` block is selected.

#### Example 5: Multi-Line Statement Selection
- **Scenario**: The cursor is inside a multi-line dictionary or function call.
- **Action**: The user presses `Ctrl+Enter`.
- **Expected Result**: The entire multi-line statement is selected.


### 2. **Refactor Existing Tests**
The existing tests in `selection.test.ts` focus on **implementation details** (e.g., `findStartLineOfPythonCodeBlock`, `findEndLineOfPythonCodeBlock`). These tests should be:

1. **Moved** to a separate file (e.g., `selectionUtils.test.ts`) to test utility functions.
2. **Simplified** to remove redundancy (e.g., tests that verify exact line numbers).
3. **Retained** for utility functions that are used across the codebase.


### 3. **Enhance Mocks**
The current mocks (`MockTextDocument` and `MockTextLine`) are **too simplistic** for testing `smartSelect` behavior. They should be enhanced to:

1. **Respect the `Range` parameter** in `getText()`.
2. **Simulate multi-line selections** and cursor positions.
3. **Support indentation-based logic** (e.g., `levelOfIndentation`).
4. **Add a `MockTextEditor`** to simulate the editor state (e.g., cursor position, selections).


### 4. **Multi-Block Documents**
The tests should simulate **real-world Python scripts** by including multiple blocks in a single document. This ensures that `smartSelect` behaves correctly when:

1. **Multiple Functions/Classes Exist**: The document contains multiple functions or classes, and the cursor is inside one of them.
2. **Blocks with Preceding/Following Code**: The target block is preceded or followed by other code blocks, multi-line statements, or comments.
3. **Mixed Content**: The document contains a mix of functions, classes, control flow blocks, and multi-line statements.

#### Example Scenarios:
- **Function Between Other Functions**: A function is defined between two other functions, and the cursor is inside the middle function.
- **Class with Methods and Nested Blocks**: A class contains multiple methods, and the cursor is inside one of the methods or a nested block.
- **Control Flow Inside Functions**: A function contains control flow blocks (e.g., `if/elif/else`, `try/except`), and the cursor is inside one of these blocks.
- **Multi-Line Statements Between Blocks**: A multi-line statement (e.g., a dictionary or function call) exists between two code blocks, and the cursor is inside the multi-line statement.


### 5. **Edge Cases**
The tests should also cover edge cases, such as:

1. **Empty Lines**: Ensure `smartSelect` handles empty lines correctly.
2. **Comments**: Ensure `smartSelect` skips comments when expanding selections.
3. **Whitespace**: Ensure `smartSelect` handles lines with only whitespace correctly.
4. **Nested Blocks**: Ensure `smartSelect` handles nested blocks (e.g., a function inside a class).


## Files Reviewed
- `/workspaces/python-smart-execute/src/test/suite/smartExecute/selection.test.ts`: Existing tests for `smartSelect` logic.
- `/workspaces/python-smart-execute/src/smartExecute/selection.ts`: Implementation of `smartSelect` and supporting logic.
- `/workspaces/python-smart-execute/src/test/suite/mocks.ts`: Mocks for `vscode.TextLine` and `vscode.TextDocument`.