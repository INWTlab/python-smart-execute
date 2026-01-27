# Development Guide

This document provides instructions for setting up the development environment and contributing to the Python Smart Execute extension.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- [npm](https://www.npmjs.com/) (usually bundled with Node.js)
- [VS Code](https://code.visualstudio.com/)

### Extension Dependencies
This extension depends on the following VS Code extensions:
- [Python extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
- [Jupyter extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/inwtlab/python-smart-execute.git
    cd python-smart-execute
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Build and Run

### Using npm Commands
- **Compile the project:**
  ```bash
  npm run compile
  ```
- **Watch mode (automatically recompile on changes):**
  ```bash
  npm run watch
  ```

### Using VS Code "Run and Debug"
1.  Open the project in VS Code.
2.  Press `F5` or go to the **Run and Debug** view and select **Run Extension**.
3.  This will open a new "Extension Development Host" window where the extension is active.

## Testing and Linting

### Linting
We use ESLint 9 to maintain code quality. To run the linter:
```bash
npm run lint
```
To automatically fix common issues:
```bash
npm run lint -- --fix
```

### Testing
We use Mocha for integration tests. To run all tests:
```bash
npm test
```
This command will:
1.  Compile the project.
2.  Run the linter.
3.  Execute the tests using `@vscode/test-electron`.

## Project Structure
- `src/extension.ts`: The main entry point for the extension.
- `src/test/`: Contains the test suite and test runner.
- `eslint.config.mjs`: ESLint configuration.
- `tsconfig.json`: TypeScript configuration.
