# User Guide: Smart Execute Modularization

## Feature Goal
Reorganize the smart execute logic into its own dedicated directory so that the selection, sanitization, execution, and stepping helpers live alongside the navigation feature under `src/`.

## Workflow & Examples
1. When the user invokes `python-smart-execute.smartExecAndStep`, the command handler delegates to the new smart execution module to determine which block to execute, sanitize indentation, send it to the configured REPL or Jupyter engine, and optionally step the cursor.
2. The refactor keeps existing behavior for handling decorators, block boundaries, and cursor progression unchanged for Python and Jupyter targets.
3. Developers can locate and extend the smart execute behavior in `src/smartExecute/`, mirroring the structure already in place for `src/navigation/`.
