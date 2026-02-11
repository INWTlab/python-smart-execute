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
│       │   ├── selection.test.ts
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
- Supports both Python REPL and Jupyter execution engines
- Includes cursor stepping functionality after execution

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
