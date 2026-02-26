# User Guide: Multiline Statement Execution

## Feature Goal
Enhance the smart execute logic to recognize and execute a complete multiline statement even when the cursor is positioned on any line within the statement, including the middle or closing lines. Previously, multiline statements were only recognized if the cursor was on the opening line.

## Workflow & Examples
1. **User Selection**: If the user has manually selected a block of code, that exact selection is executed.
2. **Block Selection**: If the cursor is on a block statement (like `def`, `class`, `if`, `else`, `try`, `except`), the entire block is selected and executed.
3. **Multiline Statement Selection**: If the cursor is inside a multiline statement (e.g., inside parentheses, brackets, or braces), the logic will find the start and end of the multiline statement and execute the entire statement.
   - Example:
     ```python
     x = (
         1 + 2
     )
     ```
     If the cursor is on `1 + 2` or `)`, the entire statement from `x = (` to `)` will be executed.
4. **Single Line Execution**: If none of the above apply, the current single line is executed.

## Priority
1. User Selection
2. Block Selection
3. Multiline Statement Selection
4. Single Line Execution

## Comprehensive Testing Scenarios

To ensure the robustness of the multiline statement detection, the following scenarios must be tested:

### 1. Single Line Execution Between Multiline Statements
When a single line statement is surrounded by multiline statements, placing the cursor on the single line should only execute that single line.
```python
x = (
    1 + 2
)
y = 3  # Cursor here should only execute `y = 3`
z = [
    4, 5
]
```

### 2. Multiline Statement Surrounded by Blocks and Other Code
When a multiline statement is surrounded by blocks (e.g., `def`, `class`) and other code, placing the cursor anywhere inside the multiline statement should correctly identify its boundaries without bleeding into the surrounding blocks.
```python
def my_func():
    pass

my_list = [
    1,
    2,  # Cursor here should execute the entire `my_list` assignment
    3
]

class MyClass:
    pass
```

### 3. Nested Multiline Statements
When a multiline statement contains nested parentheses, brackets, or braces, placing the cursor inside the nested structure should execute the outermost multiline statement.
```python
result = my_function(
    [
        1, 2,  # Cursor here should execute the entire `result = ...` statement
        3
    ],
    {"key": "value"}
)
```

### 4. Multiline Statements with Strings and Comments
When a multiline statement contains strings with parentheses or comments with parentheses, the detection logic should ignore them and correctly identify the statement boundaries.
```python
text = (
    "This is a string with (parentheses)"  # Cursor here should execute the entire `text = ...` statement
    # This is a comment with [brackets]
)
```

### 5. Cursor on the Closing Line
When the cursor is on the closing line of a multiline statement, the entire statement should be executed.
```python
my_dict = {
    "a": 1,
    "b": 2
}  # Cursor here should execute the entire `my_dict = ...` statement
```

### 6. Cursor on the Opening Line
When the cursor is on the opening line of a multiline statement, the entire statement should be executed.
```python
my_tuple = (  # Cursor here should execute the entire `my_tuple = ...` statement
    1,
    2
)
```

### 7. Complex Interactive Session Elements
Testing with elements from `examples/interactiveSession.py` to ensure compatibility with decorators, context managers, and multi-line docstrings.
```python
@decorator
def timer(func, *args, **kw):
    time_start = time.time()
    res = func(
        *args,  # Cursor here should execute the `res = func(...)` statement, NOT the whole `def timer` block (wait, `def timer` is a block, so if cursor is inside `def timer`, does it execute the block or the multiline statement? Block selection has priority if cursor is on `def`, but if cursor is on `res = func(`, it should execute the multiline statement or the block? Actually, if cursor is inside a block, the current logic executes the block if cursor is on the block definition line, otherwise it executes the line/multiline statement. We need to verify this behavior).
        **kw
    )
    return res
```
*Correction for #7*: If the cursor is on `res = func(`, it is NOT on the block definition line (`def timer`). Therefore, block selection does not apply. It should fall back to multiline statement selection and execute `res = func(\n        *args,\n        **kw\n    )`.

### 8. Multiple Independent Multiline Statements
When a file contains multiple separate multiline statements, placing the cursor in one should not accidentally include parts of another. The detection logic must correctly balance brackets and not get confused by unrelated opening or closing brackets in other statements.
```python
first_list = [
    1,
    2
]

second_list = [
    3,
    4  # Cursor here should only execute `second_list = ...`
]
```
