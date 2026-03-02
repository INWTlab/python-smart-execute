# User Story: Consistent Python Block Navigation

## Feature Goal
Fix block navigation behavior to be consistent when jumping up or down, respecting indentation boundaries and providing symmetric fallback behavior at document edges.

## Examples

### Bug #1: Asymmetric Fallback Behavior
```
# Current behavior (INCORRECT):
# When at last block with no next block → cursor stays in place
# When at first block with no previous block → cursor jumps to line 0

# Expected behavior:
# When no next block → jump to last line of document
# When no previous block → jump to line 0
# (Symmetric: both go to document edge)
```

### Bug #2: Indentation Boundary Not Respected
```python
class MyClass:
    def method1(self):
        pass
    
    def method2(self):
        pass

```
```
# Scenario A - Jumping UP from class line:
# Cursor on line 7 (empty line)
# Jump UP → currently jumps to method2 (line 5)
# EXPECTED: Should jump to previous block at same/less indentation (e.g., previous function/class above): MyClass
# OR if no previous block → go to line 0

# Scenario B - Jumping DOWN from inside method:
# Cursor on line 3 (def method1)
# Jump DOWN → currently jumps to line 5 (def method2) - nested block!
# EXPECTED: Should jump to next block at same indentation (e.g., next method or class)
# OR if no next block on same indentation level -> go to next block on lower indentation level
# OR if no next block → go to last line
```

### Missing Test Coverage
1. Test edge cases: first block (previous), last block (next)
2. Test symmetric fallback behavior
3. Test indentation boundary respect (nested blocks)
4. Test with decorators
5. Test multi-line statements
