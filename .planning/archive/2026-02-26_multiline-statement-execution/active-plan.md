# TDD Implementation Plan

## Cycle 1: `getMultilineStatementRange`
- [x] **STUB**: Update `src/smartExecute/selection.ts` to add the function signature `export function getMultilineStatementRange(currentLine: vscode.TextLine, document: vscode.TextDocument): { startLine: vscode.TextLine; endLine: vscode.TextLine } | undefined`. Return `undefined` as a stub.
- [x] **TEST**: Create unit tests in `src/test/suite/smartExecute/selectionUtils.test.ts` asserting the expected behavior of `getMultilineStatementRange` (single lines, nested brackets, strings/comments, multiple independent statements, cursor on opening/middle/closing lines).
- [x] **VERIFY FAIL**: Run test command `npm run test:unit`. **Expect failure** (Red State).
- [x] **IMPLEMENT**: Update `src/smartExecute/selection.ts` to replace the stub with the real bracket balancing logic for `getMultilineStatementRange`.
- [x] **VERIFY PASS**: Run test command `npm run test:unit`. **Expect pass** (Green State).
- [x] **REFACTOR**: Improve `getMultilineStatementRange` for readability and performance without changing behavior.
- [x] **VERIFY PASS**: Run test command `npm run test:unit` post-refactor. **Expect pass** (Refactored State).

## Cycle 2: `smartSelect` Integration
- [x] **STUB**: Update `smartSelect` in `src/smartExecute/selection.ts` to call `getMultilineStatementRange` but temporarily ignore its result to maintain the old behavior as a stub.
- [x] **TEST**: Create behavior-driven tests in `src/test/suite/smartExecute/smartSelect.test.ts` asserting the new priority logic (User Selection -> Block Selection -> Multiline Statement Selection -> Single Line Execution) and the comprehensive scenarios defined in the guide.
- [x] **VERIFY FAIL**: Run test command `npm run test:unit`. **Expect failure** (Red State).
- [x] **IMPLEMENT**: Update `smartSelect` in `src/smartExecute/selection.ts` to fully integrate `getMultilineStatementRange` and implement the correct priority logic.
- [x] **VERIFY PASS**: Run test command `npm run test:unit`. **Expect pass** (Green State).
- [x] **REFACTOR**: Clean up `smartSelect` and remove any unused functions (like the old `findMultiLineStatement` if it's no longer needed).
- [x] **VERIFY PASS**: Run test command `npm run test:unit` post-refactor. **Expect pass** (Refactored State).
