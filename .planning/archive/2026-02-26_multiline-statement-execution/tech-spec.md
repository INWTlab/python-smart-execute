# Technical Specification: Multiline Statement Execution

## 1. File Structure
- `src/smartExecute/selection.ts`: Update `smartSelect` to incorporate multiline statement detection and replace the existing `findMultiLineStatement` with a more robust `getMultilineStatementRange` function.
- `src/test/suite/smartExecute/selectionUtils.test.ts`: Add comprehensive unit tests for `getMultilineStatementRange`.
- `src/test/suite/smartExecute/smartSelect.test.ts`: Add behavior-driven tests for the new multiline selection logic, covering all scenarios defined in the guide.

## 2. API / Function Signatures

### `src/smartExecute/selection.ts`

* `getMultilineStatementRange(currentLine: vscode.TextLine, document: vscode.TextDocument): { startLine: vscode.TextLine; endLine: vscode.TextLine } | undefined`
  * **Description**: Calculates the bracket balance from the beginning of the document to determine if `currentLine` is part of a multiline statement. If it is, it scans backwards to find the `startLine` (where balance was 0) and forwards to find the `endLine` (where balance returns to 0).
  * **Returns**: The range of the multiline statement, or `undefined` if the line is not part of a multiline statement.

* `smartSelect(editor: vscode.TextEditor): string`
  * **Description**: Updated to implement the new priority logic:
    1. **User Selection**: If `!isSelectionEmpty(editor.selection)`, use it.
    2. **Multiline & Block Selection**: 
       - Determine the `targetLine`. If `getMultilineStatementRange(line, document)` returns a range, set `targetLine = range.startLine`. Otherwise, `targetLine = line`.
       - Call `findStartLineOfPythonCodeBlock(targetLine, document)` and `findEndLineOfPythonCodeBlock(targetLine, document)`.
       - If `startLine !== endLine`, it's a valid block or multiline statement. Select from `startLine` to `endLine`.
    3. **Single Line Execution**: If `startLine === endLine`, select the single `line`.

## 3. Logic Details for `getMultilineStatementRange`
1. Iterate from line 0 to `document.lineCount - 1`.
2. For each line, remove strings and comments using the existing `removeStringsAndComments` helper.
3. Count opening brackets `([{` and closing brackets `)]}`.
4. Maintain a running `currentBalance` (`+= open - close`). Clamp to `0` if it goes negative to recover gracefully from syntax errors or unmatched closing brackets.
5. Store the balance at the end of each line in an array `balances`.
6. A line `L` is inside a multiline statement if `balances[L - 1] > 0` OR `balances[L] > 0` (treating `balances[-1]` as `0`).
7. If `currentLine` is inside a multiline statement:
   - Scan backwards from `currentLine.lineNumber` to find `startLine` where `balances[startLine - 1] === 0` (or `startLine === 0`).
   - Scan forwards from `currentLine.lineNumber` to find `endLine` where `balances[endLine] === 0` (or end of document).
   - Return `{ startLine, endLine }`.
8. Otherwise, return `undefined`.

## 4. Testing Strategy
- **Unit Tests (`selectionUtils.test.ts`)**: Test `getMultilineStatementRange` with single lines, nested brackets, strings/comments containing brackets, and multiple independent multiline statements.
- **Integration Tests (`smartSelect.test.ts`)**: Test `smartSelect` behavior with cursor on opening, middle, and closing lines of multiline statements, ensuring single lines between multiline statements are executed correctly, and verifying priority between block selection and multiline selection.