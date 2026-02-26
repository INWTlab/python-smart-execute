# User Guide: Fix Multiline Statement Selection in Control Flow Blocks

## Feature Goal
Fix a bug in the Python Smart Execute extension where selecting a multiline statement (like `assert (...)`) inside a control flow block (like `if`) incorrectly includes subsequent blocks (like `else`) that have a lower indentation level.

## Workflow & Examples
1. **Current Behavior**: When the cursor is on a multiline statement inside an `if` block, the smart selection logic incorrectly includes the `else` block because it checks if the indentation is `<= rootIndentation` instead of strictly `< rootIndentation` for unrelated blocks.
2. **Expected Behavior**: The smart selection should only select the multiline statement itself, stopping before the `else` block since the `else` block has a lower indentation level than the multiline statement.
3. **Example**:
   ```python
   if True:
       assert ( # <-- cursor is here
           ""
       )
   else:
       pass
   ```
   The selection should only include the `assert` statement, not the `else` block.