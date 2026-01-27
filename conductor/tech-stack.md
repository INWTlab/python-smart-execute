# Technology Stack: Python Smart Execute

## Language & Runtime
- **TypeScript:** Primary development language, ensuring type safety and better maintainability.
- **Node.js:** The runtime for the VS Code extension host.

## Frameworks & APIs
- **VS Code Extension API:** The core API for interacting with the VS Code editor and UI components.

## Integrations
- **Microsoft Python Extension:** Essential integration for interacting with Python environments and terminal-based REPLs.
- **Jupyter Extension:** Support for routing execution to Jupyter interactive sessions.

## Tooling
- **Build System:** `tsc` (TypeScript Compiler) for transpiling TypeScript source into production-ready JavaScript.
- **Linting:** `ESLint` with `@typescript-eslint` for enforcing code quality and consistency.
- **Testing:** `Mocha` combined with `@vscode/test-electron` for integration testing within the VS Code environment.
- **CI/CD:** GitHub Actions for automated building and publishing of the extension.
