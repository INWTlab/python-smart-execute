# User Guide: Python Block Navigation

## Feature Goal
Add keyboard commands to navigate between Python code blocks intelligently, allowing users to jump up and down through classes, functions, and control structures with a single keystroke.

## Workflow & Examples

### Use Cases

**A. Top-level navigation**
- Cursor on `class MyClass:` or `def my_func()` at module scope
- Press shortcut → jumps to next/previous top-level element (class, function, variable assignment)
- Example:
  ```python
  class MyClass:        # ← cursor here, Next →
      pass

  def helper_func():    # ← lands here
      pass
  ```

**B. Member navigation**
- Cursor on a method inside a class
- Press shortcut → jumps to next/previous method in the same class
- Example:
  ```python
  class MyClass:
      def method1(self):       # ← cursor here, Next →
          pass

      def method2(self):       # ← lands here
          pass

      def method3(self):       # ← lands here on 2nd Next
          pass
  ```
- If already on last member, jumping further navigates to next top-level element

**C. Block interior navigation**
- Cursor inside function/method body or control structure body (indented lines)
- Jump Up → moves to the block header line (the line preceding the body with lower indentation)
- Jump Down → moves to the next block header at the same indentation level as the current body
- Example:
  ```python
  def my_func():               # ← cursor anywhere in this block's body
      x = 1                    # ← Up jumps to header above

      if x > 0:                # ← Down from body line jumps to this header
          y = x
      elif x < 0:             # ← Down jumps to this header
          z = -x
  ```

### Key Commands
- `python-smart-execute.navigateNextBlock`: Jump to next code block (Ctrl+Alt+Down default)
- `python-smart-execute.navigatePreviousBlock`: Jump to previous code block (Ctrl+Alt+Up default)

### Behavior Summary

**Core Principle:** Python blocks are identified by indentation changes, not keywords.

| Cursor Position (Indentation Level) | Jump Up Behavior | Jump Down Behavior |
|--------------------------------------|-------------------|--------------------|
| At block header (indentation level N) | Move to header of parent block at level N-1, or previous header at level N | Move to header of first nested block at level N+1, or next sibling at level N |
| Inside block body (indentation > N where N is header level) | Move to header of this block (the line with indentation decrease that started this body) | Move to header of next block after this body at same level, or first line after block end |

**Block Definition:**
- A block starts when a line (header) is followed by one or more lines with higher indentation (body)
- The "header" has lower indentation than its body lines
- The block ends when a line has indentation ≤ the header's indentation
- Block boundaries are determined solely by indentation changes
- Nested blocks: blocks whose headers are inside another block's body
- Sibling blocks: blocks at the same indentation level

### Edge Cases Handled
- Multi-line function definitions with parameters
- Multi-line class definitions
- Decorators are skipped when navigating
- Comments and empty lines are ignored
- Returns to class/function definition when jumping from member up
- Stops at file boundaries