# Technical Specification: Fix Multiline Statement Selection in Control Flow Blocks

## 1. File Structure
- `src/smartExecute/selection.ts`: Contains the `findEndLineOfPythonCodeBlock` function which determines the end of a selected code block.
- `src/test/suite/smartExecute/smartSelect.test.ts`: Contains tests for the smart selection behavior.

## 2. API / Function Signatures

### `src/smartExecute/selection.ts`
* `findEndLineOfPythonCodeBlock(line: vscode.TextLine, document: vscode.TextDocument)`
  - **Current Logic**: Breaks the loop if `levelOfIndentation(line.text) <= rootIndentation` AND the line is not `except`, `finally`, `elif`, `else`, or a closing parenthesis.
  - **New Logic**: 
    - Break immediately if `levelOfIndentation(line.text) < rootIndentation`.
    - If `levelOfIndentation(line.text) === rootIndentation`, break if the line is not `except`, `finally`, `elif`, `else`, or a closing parenthesis.
    - Otherwise, include the line in the block.

### `src/test/suite/smartExecute/smartSelect.test.ts`
* Add a new test case in the `Multiline Statement Selection Tests` suite to verify that selecting a multiline statement inside an `if` block does not include the subsequent `else` block.