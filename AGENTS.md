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
- **Run all unit tests**: `npm run test:unit`
- **Prepublish**: `npm run vscode:prepublish`

### Running Single Tests
- **Single test file**: `npm run compile && npx mocha --ui tdd out/test/suite/path/to/test.js`
- **Tests matching pattern**: `npm run test:unit -- --grep "pattern"`
- **Example**: `npm run compile && npx mocha --ui tdd out/test/suite/smartExecute/smartSelect.test.js`

### Skill
Use the `run-unit-tests` skill to compile, lint, and run unit tests in one step.

### Testing Notes
- Unit tests use Mocha with TDD interface (`suite`/`test`)
- Integration tests require xvfb and are unavailable in dev-container
- Test files are colocated with implementation in `src/test/suite/{module}/`

## Development Workflow

1. `npm install` - Install dependencies
2. `npm run watch` - Start watch mode during development
3. Press `F5` in VS Code to launch Extension Development Host
4. `npm run test:unit` - Run unit tests during implementation

## Code Style Guidelines

### TypeScript Rules

#### Variable Declarations
- **Always** use `const` or `let`. **Never** use `var`
- Use `const` by default, only use `let` when reassignment is needed

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

#### Strings and Types
- Use single quotes for string literals: `'text'`
- Use template literals for interpolation: `` `${variable}` ``
- Always use triple equals (`===`) and not equals (`!==`)
- **Avoid** `any` type - prefer `unknown` or specific types
- **Avoid** type assertions (`x as SomeType`) and non-nullability assertions (`y!`)

### Naming Conventions
- **UpperCamelCase**: Classes, interfaces, types, enums, decorators
- **lowerCamelCase**: Variables, parameters, functions, methods, properties
- **CONSTANT_CASE**: Global constants and enum values
- **Do not** use `_` prefix/suffix for private properties

### Import Organization
- Group imports: Node.js built-ins, third-party, local modules
- Use `import * as vscode from "vscode"` pattern for VS Code API
- Example:
  ```typescript
  import * as vscode from "vscode";
  import * as path from 'path';
  import { runTests } from '@vscode/test-electron';
  ```

### Error Handling
- Use try/catch blocks for async operations
- Return early to reduce nesting
- Example:
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

### Comments
- Use `/** */` for documentation comments
- Use `//` for implementation comments
- Document *why*, not *what*
- **Do not** add comments unless necessary

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
│   ├── runTest.ts           # Integration test runner (requires xvfb)
│   ├── runUnitTests.ts      # Unit test runner (no VS Code required)
│   └── suite/
│       ├── index.ts         # Test suite setup
│       ├── mocks.ts         # VS Code API mocks for unit testing
│       ├── vscode.mock.ts   # VS Code module mock
│       ├── smartExecute/    # Smart execution tests
│       └── navigation/      # Navigation tests
```

## Extension-Specific Patterns

### Command Registration
- Register commands in `activate` function using `context.subscriptions.push`
- Use `vscode.commands.registerCommand` for command registration
- Access configuration with `vscode.workspace.getConfiguration`
- Handle editor state with `vscode.window.activeTextEditor`

### Module Organization
- **navigation/**: Python block navigation utilities (jump to next/previous code blocks)
- **smartExecute/**: Smart code selection and execution logic
- Functions are exported for testability
- Tests colocated with modules in `src/test/suite/{module}/`

### Code Selection and Execution
- Extension intelligently selects Python code blocks
- Handles decorators, indentation, and code block boundaries
- Supports multi-line statements (dictionaries, function calls, nested brackets)
- Supports both Python REPL and Jupyter execution engines
- Includes cursor stepping functionality after execution

## Testing Guidelines

### Test Structure
- Use Mocha TDD interface: `suite()` and `test()`
- Group related tests in nested suites
- Use descriptive test names

### Mock Data
- Use `MockTextDocument` and `MockTextEditor` from `src/test/suite/mocks.ts`
- Define multiline content with template literals to preserve formatting
- Use `assert.strictEqual` for string comparisons

### Mocking Configuration
```typescript
const originalGetConfig = getConfigSmartExecute;
(getConfigSmartExecute as unknown as () => boolean) = () => true;
// ... test code ...
(getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
```

## Development Best Practices

1. **Before committing**: Run `npm run test:unit` to verify all tests pass
2. **Use F5**: Launch Extension Development Host for manual testing
3. **Follow existing patterns**: Codebase has consistent structure and style
4. **Export for testing**: Make helper functions exportable for testability
5. **Configuration aware**: Extension behavior configurable via VS Code settings
6. **Error handling**: Always handle async errors gracefully
7. **Type safety**: Maintain strict TypeScript compliance
