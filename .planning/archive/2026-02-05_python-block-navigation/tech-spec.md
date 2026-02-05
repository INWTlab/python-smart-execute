# Technical Specification: Python Block Navigation

## 1. File Structure

```
src/
├── extension.ts                    # Main extension (register commands)
│
└── navigation/
    ├── blockNavigator.ts          # Main jump logic
    │   ├── `jumpNextBlock()`      # Jump to next block
    │   ├── `jumpPreviousBlock()`  # Jump to previous block
    │   └── `getTargetPosition()`  # Determine target line based on direction
    │
    ├── blockFinder.ts             # Block detection utilities
    │   ├── `findBlockHeaderFromLine()`    # Find header of block containing line
    │   ├── `findNextBlockHeader()`        # Find next block header from position
    │   ├── `findPreviousBlockHeader()`    # Find previous block header from position
    │   ├── `findFirstNestedBlockHeader()`  # Find first nested block header
    │   ├── `getParentBlockHeader()`       # Find parent block header
    │   └── `isBlockHeader()`             # Check if line is a block header
    │
    └── multiLineStatement.ts       # Multi-line statement handling
        ├── `isOpenParenthesisLine()`      # Detect unclosed opening bracket
        ├── `isMultiLineStatementEnd()`     # Detect if line ends multi-line statement
        └── `skipMultiLineStatement()`     # Jump around multi-line statements
```

## 2. API / Function Signatures

### `extension.ts`

```typescript
export function activate(context: vscode.ExtensionContext) {
    // ... existing smart execute commands ...

    context.subscriptions.push(
        vscode.commands.registerCommand('python-smart-execute.jumpNextBlock', async () => {
            await jumpNextBlock();
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('python-smart-execute.jumpPreviousBlock', async () => {
            await jumpPreviousBlock();
        }),
    );
}
```

### `blockNavigator.ts`

```typescript
/**
 * Jump to the next code block based on indentation
 */
export async function jumpNextBlock(): Promise<void>;

/**
 * Jump to the previous code block based on indentation
 */
export async function jumpPreviousBlock(): Promise<void>;

/**
 * Determine the target line number for jumping
 *
 * @param currentLine - Current cursor line
 * @param document - The VS Code document
 * @param direction - 'next' or 'previous'
 * @returns Target line number to jump to
 */
export function getTargetPosition(
    currentLine: vscode.TextLine,
    document: vscode.TextDocument,
    direction: 'next' | 'previous'
): number;
```

### `blockFinder.ts`

```typescript
/**
 * Find the block header that contains the given line as part of its body
 *
 * @param line - Line to find containing block for
 * @param document - The VS Code document
 * @returns The header line of the containing block, or null if at top level
 */
export function findBlockHeaderFromLine(
    line: vscode.TextLine,
    document: vscode.TextDocument
): vscode.TextLine | null;

/**
 * Find the next block header at the same or parent indentation level
 *
 * @param startLine - Line to start searching from
 * @param document - The VS Code document
 * @param targetIndentLevel - Indentation level to match (default: current line's level)
 * @returns The next block header line, or null if none found
 */
export function findNextBlockHeader(
    startLine: vscode.TextLine,
    document: vscode.TextDocument,
    targetIndentLevel?: number
): vscode.TextLine | null;

/**
 * Find the previous block header at the same or parent indentation level
 *
 * @param startLine - Line to start searching from
 * @param document - The VS Code document
 * @param targetIndentLevel - Indentation level to match (default: current line's level)
 * @returns The previous block header line, or null if none found
 */
export function findPreviousBlockHeader(
    startLine: vscode.TextLine,
    document: vscode.TextDocument,
    targetIndentLevel?: number
): vscode.TextLine | null;

/**
 * Find the first nested block header inside the current block body
 *
 * @param line - A line inside the current block
 * @param document - The VS Code document
 * @returns The first nested block header, or null if no nested blocks
 */
export function findFirstNestedBlockHeader(
    line: vscode.TextLine,
    document: vscode.TextDocument
): vscode.TextLine | null;

/**
 * Find the parent block header
 *
 * @param line - Current line
 * @param document - The VS Code document
 * @returns The parent block header line, or null if at top level
 */
export function getParentBlockHeader(
    line: vscode.TextLine,
    document: vscode.TextDocument
): vscode.TextLine | null;

/**
 * Check if a line is a block header (has body lines with higher indentation)
 *
 * @param line - Line to check
 * @param document - The VS Code document
 * @returns True if line is a block header
 */
export function isBlockHeader(
    line: vscode.TextLine,
    document: vscode.TextDocument
): boolean;
```

### `multiLineStatement.ts`

```typescript
/**
 * Check if a line opens a multi-line statement that spans to subsequent lines
 * (unclosed parentheses, brackets, braces, or backslash)
 *
 * @param line - Line to check
 * @returns The closing delimiter that opens the statement, or empty if none
 */
export function isOpenParenthesisLine(line: string): '(' | '[' | '{' | '\\' | '';

/**
 * Check if a line ends a multi-line statement
 *
 * @param line - Line to check
 * @param opener - The opening delimiter
 * @returns True if line contains the closing delimiter
 */
export function isMultiLineStatementEnd(line: string, opener: '(' | '[' | '{' | '\\'): boolean;

/**
 * Skip over multi-line statements when navigating
 * Returns the last line of the multi-line construct if one is detected
 *
 * @param startLine - Starting line
 * @param document - The VS Code document
 * @param direction - 'next' or 'previous'
 * @returns The last line of the multi-line statement, or the original line if not multi-line
 */
export function skipMultiLineStatement(
    startLine: vscode.TextLine,
    document: vscode.TextDocument,
    direction: 'next' | 'previous'
): vscode.TextLine;
```

## 3. Relevant Configuration

Update `package.json` to add new commands and keybindings:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "python-smart-execute.jumpNextBlock",
        "title": "Python Smart Execute: Jump to next block"
      },
      {
        "command": "python-smart-execute.jumpPreviousBlock",
        "title": "Python Smart Execute: Jump to previous block"
      }
    ],
    "keybindings": [
      {
        "key": "ctrl+alt+down",
        "command": "python-smart-execute.jumpNextBlock",
        "when": "editorTextFocus && editorLangId == 'python'"
      },
      {
        "key": "ctrl+alt+up",
        "command": "python-smart-execute.jumpPreviousBlock",
        "when": "editorTextFocus && editorLangId == 'python'"
      }
    ]
  }
}
```

## 4. Jump Algorithm

### Jump to Next Block (`jumpNextBlock`)

1. Get current cursor line
2. Skip over any multi-line statements (`skipMultiLineStatement`)
3. Determine current indentation level
4. Check if current line is a block header:
   - YES: Look for first nested block header (level+1), if none, look for next sibling (level), if none, look for parent's next sibling
   - NO (inside body): Find the block header, then find its next sibling or parent's next sibling

### Jump to Previous Block (`jumpPreviousBlock`)

1. Get current cursor line
2. Skip over any multi-line statements backwards
3. Check if current line is a block header:
   - YES: Look for previous sibling at same level, if none, look for parent header
   - NO (inside body): Find the block header (jump up to header)
4. Move cursor to target line and reveal it

### Multi-Line Statement Handling

When jumping, detect if we're in the middle of a multi-line statement:
- Track opening delimiters: `(`, `[`, `{`, `\`
- Span extends until matching closing delimiter is found
- When moving from outside into a multi-line statement, skip to the end
- When inside a multi-line statement, skip to the end when moving forward, or start when moving backward
- Multi-line statements are NOT treated as blocks (they're single logical statements)

## 5. Types and Interfaces

```typescript
interface BlockInfo {
    header: vscode.TextLine;
    firstBodyLine: vscode.TextLine;
    lastBodyLine: vscode.TextLine;
    indentationLevel: number;
    parentBlock: BlockInfo | null;
    childBlocks: BlockInfo[];
}
```

## 6. Test Strategy

### Unit Tests for `blockFinder.ts`
- Test indentification of block headers
- Test finding parent/child blocks
- Test sibling block navigation
- Edge cases: empty file, single line, deeply nested blocks

### Unit Tests for `multiLineStatement.ts`
- Test detection of opening/closing delimiters
- Test nesting of brackets
- Test escaped line continuations
- Test combinations (dict inside list comprehension)

### Integration Tests
- Full navigation scenarios for use cases A, B, C
- Navigation in complex nested structures
- Navigation with multi-line statements interleaved
- Multi-file scenarios (cursor at file boundaries)