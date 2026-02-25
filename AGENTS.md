# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Project Overview

This is a VS Code extension called "Python Smart Execute" that intelligently sends Python code selections to REPLs or Jupyter sessions. It includes decorators in selections and automatically jumps to the beginning of the next line after execution.

## Build, Lint, and Test Commands

### Core Commands
- **Compile TypeScript**: `npm run compile`
- **Watch mode (auto-recompile)**: `npm run watch`
- **Lint**: `npm run lint`
- **Lint with auto-fix**: `npm run lint -- --fix`
- **Run all tests**: `npm run test:unit` (runs logic tests using Mocha directly; xvfb-run is unavailable in dev-container)
- **Prepublish**: `npm run vscode:prepublish`

### Testing
 - **Compile & lint**: `npm run compile && npm run lint`
 - **Unit tests**: `npm run test:unit` (runs logic tests with Mocha; integration tests require xvfb and are unavailable in dev-container)
 - **Test structure**: Behavior-driven tests (e.g., `smartSelect.test.ts`) and unit tests (e.g., `selectionUtils.test.ts`) are colocated with implementation code in `src/test/suite/{module}/`

### Development Workflow
1. `npm install` - Install dependencies (includes xvfb for headless testing)
2. `npm run watch` - Start watch mode during development
3. Press `F5` in VS Code to launch Extension Development Host
4. `npm run test:unit` - Run unit tests during implementation (integration tests require xvfb and are unavailable in dev-container)

## Code Style Guidelines

### TypeScript Specific Rules

#### Variable Declarations
- **Always** use `const` or `let`. **Never** use `var`
- Use `const` by default, only use `let` when reassignment is needed
- Example: `const config = vscode.workspace.getConfiguration(...)`

#### Modules and Exports
- Use ES6 modules (`import`/`export`)
- Use named exports: `export function activate(...)`
- **Do not** use default exports
- **Do not** use `namespace`

#### Classes and Interfaces
- Use `UpperCamelCase` for classes, interfaces, types, enums
- Use `private` visibility modifier (not `#private` fields)
- Mark non-reassigned properties with `readonly`
- **Never** use the `public` modifier (it's the default)

#### Functions
- Prefer function declarations for named functions: `function activate(...)`
- Use arrow functions for anonymous functions/callbacks
- Use `lowerCamelCase` for function names

#### Code Structure (from existing codebase)

```typescript
// File structure pattern:
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    // Main extension logic
}

export function deactivate() {}

// Helper functions (exported for testing)
export function findNextCodeLine(...) { ... }
export function isDecorator(text: string) { ... }

// Private helper functions
function getConfigEngine(): string { ... }
function smartSelect() { ... }
```

#### Strings and Types
- Use single quotes for string literals: `'text'`
- Use template literals for interpolation: `` `${variable}` ``
- Always use triple equals (`===`) and not equals (`!==`)
- **Avoid** `any` type - prefer `unknown` or specific types
- **Avoid** type assertions (`x as SomeType`) and non-nullability assertions (`y!`)

#### Naming Conventions
- **UpperCamelCase**: Classes, interfaces, types, enums, decorators
- **lowerCamelCase**: Variables, parameters, functions, methods, properties
- **CONSTANT_CASE**: Global constants and enum values
- **Do not** use `_` prefix/suffix for private properties

### Import Organization
- Group imports: Node.js built-ins, third-party, local modules
- Use `import * as vscode from "vscode"` pattern for VS Code API
- Example from codebase:
```typescript
import * as vscode from "vscode";
import * as path from 'path';
import { runTests } from '@vscode/test-electron';
```

### Error Handling
- Use try/catch blocks for async operations
- Return early to reduce nesting
- Example from codebase:
```typescript
async function main() {
    try {
        await runTests({ extensionDevelopmentPath, extensionTestsPath });
    } catch (err) {
        console.error('Failed to run tests', err);
        process.exit(1);
    }
}
```

### Comments and Documentation
- Use `/** */` for documentation comments
- Use `//` for implementation comments
- Document *why*, not *what*
- **Do not** declare types in `@param` blocks (redundant in TypeScript)

## Configuration Files

### ESLint Configuration
- Uses ESLint 9 with TypeScript support
- Key rules enforced:
  - `@typescript-eslint/naming-convention`: warn
  - `curly`: warn (always use braces)
  - `eqeqeq`: warn (always use ===)
  - `@typescript-eslint/no-unused-vars`: warn with `argsIgnorePattern: "^_"`

### TypeScript Configuration
- Target: ES6
- Module: CommonJS
- Output directory: `out/`
- Strict mode enabled
- Root directory: `src/`

## Project Structure

```
src/
├── extension.ts              # Main extension entry point
├── navigation/               # Python block navigation module
│   ├── blockFinder.ts       # Finds Python code blocks (functions, classes, if/elif/else)
│   ├── blockNavigator.ts    # Navigation commands (jumpNextBlock, jumpPreviousBlock)
│   └── multiLineStatement.ts # Multi-line statement handling
├── smartExecute/             # Smart code selection and execution module
│   ├── config.ts            # Configuration helpers
│   ├── execution.ts         # REPL/Jupyter execution logic
│   ├── selection.ts         # Smart code selection utilities
│   └── helpers.ts           # Shared helper functions
├── test/
│   ├── runTest.ts          # Test runner
│   ├── runUnitTests.ts     # Unit test runner
│   └── suite/
│       ├── index.ts        # Test suite setup
│       ├── extension.test.ts
│       ├── mocks.ts        # VS Code API mocks
│       ├── smartExecute/   # Smart execution tests
│       │   ├── selection.test.ts          # Implementation tests for selection utilities
│       │   ├── selectionUtils.test.ts     # Unit tests for utility functions
│       │   ├── smartSelect.test.ts        # Behavior-driven tests for smartSelect
│       │   └── execution.test.ts
│       ├── blockFinder.test.ts
│       ├── blockNavigator.test.ts
│       └── multiLineStatement.test.ts
├── package.json            # Extension manifest
├── tsconfig.json          # TypeScript config
├── eslint.config.mjs      # ESLint config
└── DEVELOPMENT.md         # Development guide
```

## Extension Specific Patterns

### Module Organization
- **navigation/**: Python block navigation utilities (jump to next/previous code blocks)
- **smartExecute/**: Smart code selection and execution logic
- Functions are exported for testability
- Tests colocated with modules in `src/test/suite/{module}/`

### VS Code Extension Development
- Register commands in `activate` function using `context.subscriptions.push`
- Use `vscode.commands.registerCommand` for command registration
- Access configuration with `vscode.workspace.getConfiguration`
- Handle editor state with `vscode.window.activeTextEditor`

### Code Selection and Execution
- Extension intelligently selects Python code blocks
- Handles decorators, indentation, and code block boundaries
- Supports multi-line statements (dictionaries, function calls, nested brackets)
- Supports both Python REPL and Jupyter execution engines
- Includes cursor stepping functionality after execution
- **SmartSelect Behavior**:
  - Single line selection when smart selection is disabled
  - Function/class selection with decorators
  - Control flow selection (if/elif/else, try/except/finally)
  - Multi-block document handling (targets specific blocks)
  - Edge case handling (comments, empty lines, whitespace)

### Block Navigation
- Commands: `pythonJumpNextBlock`, `pythonJumpPreviousBlock`
- Handles multi-line statements (open parentheses, brackets)
- Finds block boundaries (functions, classes, if/elif/else/try)

## Development Best Practices

1. **Before committing**: Always run `npm run test:unit` (unit tests only; full suite requires xvfb and is unavailable in dev-container)
2. **Use F5**: Launch Extension Development Host for testing
3. **Follow existing patterns**: Codebase has consistent structure and style
4. **Export for testing**: Make helper functions exportable for testability
5. **Configuration aware**: Extension behavior configurable via VS Code settings
6. **Error handling**: Always handle async errors gracefully
7. **Type safety**: Maintain strict TypeScript compliance

---

## Test-Specific String Formatting and Comparison

### 1. Multiline String Formatting in Tests
When defining multiline strings for test cases, use **template literals** (`` ` ``) to preserve exact formatting, including indentation, line breaks, and whitespace. This is critical for testing Python code selection logic, where formatting directly impacts behavior.

#### Examples:
- **Template Literals for Python Code Blocks**:
  ```typescript
  const pythonCode = `
  @decorator
  def example_function():
      if True:
          print("Hello, world!")
  `;
  ```
  This ensures that indentation and line breaks are preserved exactly as written.

- **Handling Edge Cases**:
  Use template literals to define strings with mixed indentation or empty lines:
  ```typescript
  const mixedIndentation = `
  def example():
      if True:
          print("Indented")
      print("Not indented")
  `;
  ```

---

### 2. String Comparison Best Practices
#### Choosing the Right Assertion
- **Use `assert.strictEqual`** for string comparisons to ensure both content and type are validated.
  ```typescript
  assert.strictEqual(actualSelection, expectedSelection);
  ```
- **Avoid `assert.equal`** unless you explicitly want loose equality checks.

#### Handling Whitespace and Newlines
- Preserve whitespace and newlines in test strings, as they are critical for Python code selection logic.
- **Trailing Newlines**: Be explicit about including or excluding trailing newlines in the expected string. Mismatches will cause test failures.

#### Debugging Mismatches
- Log `actual` and `expected` values with escape characters when assertions fail to debug mismatches:
  ```typescript
  console.log(`Expected: ${JSON.stringify(expectedSelection)}`);
  console.log(`Actual: ${JSON.stringify(actualSelection)}`);
  ```

---

### 3. Mock Data Construction
#### Constructing Mock Content
- Use the `MockTextDocument` class (defined in `mocks.ts`) to simulate VS Code's `TextDocument` API for testing.
- Define mock content using template literals to ensure consistency with real-world scenarios:
  ```typescript
  const mockDocument = new MockTextDocument(`
  @decorator
  def example_function():
      print("Hello, world!")
  `);
  ```

#### Guidelines for `expectedSelection`
- Define `expectedSelection` strings using template literals to match the exact formatting of the expected output:
  ```typescript
  const expectedSelection = `
  @decorator
  def example_function():
      print("Hello, world!")
  `;
  ```
- Ensure mock content mirrors real-world scenarios, such as:
  - Python functions with decorators.
  - Multi-line statements (e.g., dictionaries, function calls).
  - Edge cases like empty lines or mixed indentation.

---

### 4. Test Case Structure for String-Heavy Logic
#### Structuring Test Cases
- Group test cases by scenario (e.g., "should select a function with decorators," "should handle multi-line statements").
- Use descriptive test names to clarify the expected behavior:
  ```typescript
  test("should select a function with decorators", () => { ... });
  test("should handle multi-line statements", () => { ... });
  ```

#### Helper Functions for String Comparison
- While exact string matching is preferred, you can define helper functions to simplify comparisons for complex cases:
  ```typescript
  function normalizeWhitespace(text: string): string {
      return text.replace(/\s+/g, " ").trim();
  }
  ```
  Use this sparingly, as it may mask formatting issues in Python code.

#### Example Test Case
```typescript
test("should select a function with decorators", () => {
    const document = new MockTextDocument(`
    @decorator
    def example_function():
        print("Hello, world!")
    `);
    const selection = smartSelect(document, new vscode.Position(2, 0));
    const expectedSelection = `
    @decorator
    def example_function():
        print("Hello, world!")
    `;
    assert.strictEqual(selection, expectedSelection);
});
```

---

### Key Takeaways
1. **Use template literals** for multiline strings to preserve exact formatting.
2. **Prefer `assert.strictEqual`** for string comparisons to ensure precision.
3. **Log escape characters** when debugging mismatches to identify whitespace or newline issues.
4. **Construct mock data** using `MockTextDocument` and template literals to mirror real-world scenarios.
5. **Structure test cases** to validate multiline string outputs, grouping them by scenario for clarity.

## VS Code Integration

### Key Bindings (Extension Contribution)
- `Ctrl+Enter`: (Smart) Execute selection or line and step cursor
- `Ctrl+Alt+Down`: Navigate to next code block
- `Ctrl+Alt+Up`: Navigate to previous code block

### Extension Dependencies
- `ms-python.python`: Python extension
- `ms-toolsai.jupyter`: Jupyter extension
- VS Code API version: ^1.96.0

## Memory and Performance

- Keep command handlers lightweight
- Use async/await for non-blocking operations
- Dispose resources properly in `deactivate` function
- Minimize memory usage in extension lifecycle
