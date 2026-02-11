# Technical Specification: Smart Execute Modularization

## 1. File Structure
- `src/extension.ts`: Extension entry point, registers commands for smart execution and navigation (keeps registration logic, delegates to modules)
- `src/smartExecute/selection.ts`: Core selection logic for Python code block expansion and cursor stepping
- `src/smartExecute/execution.ts`: Sends sanitized selections to Python REPL or Jupyter
- `src/navigation/`: (pre-existing) Navigation helper for block boundaries used by both execution and navigation
  - `src/navigation/blockNavigator.ts`: Provides `jumpNextBlock` / `jumpPreviousBlock`
  - `src/navigation/blockFinder.ts`: (pre-existing) Helper

## 2. Test Structure
- `src/test/suite/smartSelect.test.ts`: (existing) Tests for `smartSelect`, `sanitizeSelection`, `findStartLineOfPythonCodeBlock`, `findEndLineOfPythonCodeBlock`, `findNextCodeLine`, and related helpers (to be moved to `src/smartExecute/selection.ts` and `src/smartExecute/execution.ts`)
- `src/test/suite/navigation/`: (existing location) Navigation-related tests
- After refactor, unit tests for functions in `src/smartExecute/` will be colocated in `src/test/suite/smartExecute/` mirroring the source structure

## 3. API / Function Signatures

### `src/extension.ts`
```typescript
export function activate(context: vscode.ExtensionContext): void // extension entry
// Registers commands `smartExecAndStep`, `debugExecAndStep`, `navigateToNextBlock`, `navigateToPreviousBlock`
```

### `src/smartExecute/selection.ts`
```typescript
export async function runSmartExecuteAndStep(engine: string): Promise<void>
//   engine: "python" | "jupyter"
//   orchestrates: selection expansion -> sanitize -> execution -> stepCursor

export async function runDebugExecAndStep(): Promise<void>
//   Uses VS Code debug command for selection execution and steps

export function smartSelect(editor: vscode.TextEditor): string
//   Returns current selection text or expands to block line range

export function sanitizeSelection(code: string): string
//   Normalizes indentation, fills empty lines, adds block exit if needed

export function findStartLineOfPythonCodeBlock(
    line: vscode.TextLine,
    document: vscode.TextDocument
): vscode.TextLine

export function findEndLineOfPythonCodeBlock(
    line: vscode.TextLine,
    document: vscode.TextDocument
): vscode.TextLine

export function findNextCodeLine(
    line: vscode.TextLine,
    document: vscode.TextDocument
): vscode.TextLine

export function stepCursor(editor: vscode.TextEditor): void
//   Advances cursor to next code line (respecting comments/blank lines/decorators)
```

### `src/smartExecute/execution.ts`
```typescript
export async function selectionToRepl(selection: string, engine: string): Promise<void>
//   Sends sanitized selection to configured engine (Python REPL via terminal or Jupyter via command)
```

### `src/navigation/blockNavigator.ts`
```typescript
export function jumpNextBlock(document: vscode.TextDocument, position: vscode.Position): vscode.Position
export function jumpPreviousBlock(document: vscode.TextDocument, position: vscode.Position): vscode.Position
```

### Configuration Access (helpers – private in `src/smartExecute/config.ts`)
```typescript
export function getConfigEngine(): string
export function getConfigSmartExecute(): boolean
export function getConfigStep(): boolean
export function getConfigDelay(): number
```

### Utility Helpers
- `isDecorator(text: string): boolean` – Detects `@...` decorators
- `isClosingParenthesis(text: string): boolean` – Detects closing `)`, `]`, `}`
- `isExcept`, `isFinally`, `isElif`, `isElse` – Python block structure checks
- `levelOfIndentation(line: string): number` – Leading whitespace length
- `indentationAsString(line: string): string` – Whitespace prefix at line start
- `lineIsCode(line: vscode.TextLine | undefined): boolean` – Non-empty, not comment only
- `newSelectionForBlock`, `newSelectionForLine`, helper for `Selection` building
- Small `delay(ms: number): Promise<void>` wrapper for execution pacing