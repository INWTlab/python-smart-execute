# Technical Specification: Consistent Python Block Navigation

## 1. Files to Modify

- **`src/navigation/blockNavigator.ts`**: Fix asymmetric fallback behavior and update to use indentation-aware navigation
  - Current behavior: No next block → stays in place; No previous block → goes to line 0
  - New behavior: Both should go to document edges (last line / line 0) AND respect indentation hierarchy
  - Functions affected: `jumpNextBlock()` (lines 26-42), `jumpPreviousBlock()` (lines 48-64)

- **`src/navigation/blockFinder.ts`**: Make block finding functions indentation-aware
  - Current behavior: `findNextBlockHeader()` and `findPreviousBlockHeader()` find ANY block regardless of nesting
  - New behavior: Accept optional indentation parameter to respect nesting hierarchy
  - Functions affected: `findNextBlockHeader()` (lines 109-125), `findPreviousBlockHeader()` (lines 133-149)

- **`src/test/suite/blockNavigator.test.ts`**: Add comprehensive edge case and indentation tests
  - Current behavior: Only 39 lines with basic export tests
  - New behavior: Full coverage of edge cases, symmetric fallback, indentation boundaries
  - Tests to add: 8 new test scenarios (see Test Strategy section)

- **`src/test/suite/blockFinder.test.ts`**: Add indentation-aware finding tests
  - Current behavior: Only 33 lines with basic utility tests
  - New behavior: Coverage of nested block scenarios with indentation
  - Tests to add: 6 new test scenarios (see Test Strategy section)

## 2. Files to Create

None - all changes are modifications to existing files.

## 3. Implementation Approach

### What to Implement

**Bug Fix #1: Symmetric Fallback Behavior**

- **Symmetric Document Edge Navigation**
  - **Location**: `src/navigation/blockNavigator.ts` (lines 26-42 and 48-64)
  - **Approach**: 
    1. In `jumpNextBlock()`: When no next block found, return `new vscode.Position(document.lineCount - 1, 0)` instead of `currentPosition`
    2. In `jumpPreviousBlock()`: Already correct (goes to line 0)
  - **Tools/Utilities to use**: VS Code API `document.lineCount` to get last line number
  - **Edge cases**: Empty documents, single-line documents, cursor already at last line

**Bug Fix #2: Indentation-Aware Navigation**

- **Enhanced findNextBlockHeader**
  - **Location**: `src/navigation/blockFinder.ts` (lines 109-125)
  - **Approach**: 
    1. Add optional parameter `targetIndentLevel?: number`
    2. When provided, only return blocks at specified indentation level or less (parent level)
    3. Search algorithm: current level → parent level → grandparent level (stop at 0)
    4. Use `levelOfIndentation()` to check each candidate block
  - **Tools/Utilities to use**: `levelOfIndentation()` (already exists in same file), `isBlockHeader()` (already exists)
  - **Edge cases**: 
    - No blocks at same level → should find parent's next sibling
    - At top-level → should only find other top-level blocks
    - Decorators above blocks → should be included in block selection

- **Enhanced findPreviousBlockHeader**
  - **Location**: `src/navigation/blockFinder.ts` (lines 133-149)
  - **Approach**: 
    1. Add optional parameter `targetIndentLevel?: number`
    2. When provided, only return blocks at specified indentation level or less
    3. Search backward: current level → parent level → grandparent level
    4. Use `levelOfIndentation()` to validate indentation
  - **Tools/Utilities to use**: `levelOfIndentation()`, `isBlockHeader()`
  - **Edge cases**:
    - First block at indentation level → should find previous block at parent level
    - Mixed indentation in document → should respect boundaries
    - Multi-line statements → should skip to block headers only

- **Update Navigation Commands**
  - **Location**: `src/navigation/blockNavigator.ts` (lines 26-42, 48-64)
  - **Approach**:
    1. Get current block's indentation using `levelOfIndentation(document.lineAt(blockHeader.lineNumber).text)`
    2. Pass indentation to `findNextBlockHeader()` and `findPreviousBlockHeader()`
    3. Maintain symmetric fallback behavior from Bug Fix #1
  - **Tools/Utilities to use**: `levelOfIndentation()` from blockFinder.ts, existing block header detection
  - **Edge cases**: 
    - Cursor on non-block line → should find containing block first (already handled by `findBlockHeaderFromLine`)
    - Decorator handling → decorators should be included with their blocks

### External Dependencies

**Decision: Build vs Buy**
- [x] No new external dependencies needed

All required utilities already exist in the codebase:
- `levelOfIndentation()` - indentation calculation
- `isBlockHeader()` - block detection
- `skipMultiLineStatement()` - multi-line handling
- VS Code API - document/position manipulation

## 4. Test Strategy

### What to Test

**Block Navigator Tests** (`src/test/suite/blockNavigator.test.ts`):

1. **Symmetric Fallback at Document End**
   - **What**: Verify next navigation goes to last line when no next block
   - **Given**: Cursor on last block in document
   - **When**: User triggers `pythonJumpNextBlock`
   - **Then**: Cursor moves to last line of document
   - **Edge cases**: Single-block document, cursor already at last line

2. **Symmetric Fallback at Document Start**
   - **What**: Verify previous navigation goes to line 0 when no previous block
   - **Given**: Cursor on first block in document
   - **When**: User triggers `pythonJumpPreviousBlock`
   - **Then**: Cursor moves to line 0
   - **Edge cases**: Single-block document, cursor already at line 0

3. **Same-Level Next Block Navigation**
   - **What**: Verify navigation stays at same indentation level
   - **Given**: Nested function at indent level 4
   - **When**: User triggers `pythonJumpNextBlock`
   - **Then**: Jumps to next block at indent level 4 (not parent's sibling at level 0)
   - **Edge cases**: No same-level block exists (should go to parent level)

4. **Same-Level Previous Block Navigation**
   - **What**: Verify backward navigation stays at same indentation level
   - **Given**: Nested function at indent level 4
   - **When**: User triggers `pythonJumpPreviousBlock`
   - **Then**: Jumps to previous block at indent level 4
   - **Edge cases**: First block at this level (should go to parent level)

5. **Parent Level Fallback**
   - **What**: Verify fallback to parent indentation level
   - **Given**: Last nested block at indent level 4
   - **When**: User triggers `pythonJumpNextBlock`
   - **Then**: Jumps to parent's next sibling at indent level 0
   - **Edge cases**: No parent sibling (should go to document end)

6. **Decorator Handling**
   - **What**: Verify decorators are included with their blocks
   - **Given**: Cursor on decorated function
   - **When**: User triggers navigation
   - **Then**: Cursor lands on decorator line (not def line)
   - **Edge cases**: Multiple decorators, nested decorated functions

7. **Mixed Indentation Document**
   - **What**: Verify correct navigation with complex nesting
   - **Given**: Document with functions at levels 0, 4, 8
   - **When**: Navigate from level 8 block
   - **Then**: Follows hierarchy: level 8 → level 8 → level 4 → level 0
   - **Edge cases**: Skipping multiple levels, irregular indentation

8. **Multi-line Statement Boundaries**
   - **What**: Verify multi-line statements don't interfere with navigation
   - **Given**: Block with multi-line dictionary/function call
   - **When**: Navigate across multi-line statement
   - **Then**: Jumps to actual block headers, not intermediate lines
   - **Edge cases**: Multi-line within nested block

**Block Finder Tests** (`src/test/suite/blockFinder.test.ts`):

1. **findNextBlockHeader with Target Indent**
   - **What**: Verify function respects indentation parameter
   - **Given**: Document with blocks at multiple levels, targetIndentLevel=4
   - **When**: Call `findNextBlockHeader(document, startLine, 4)`
   - **Then**: Returns next block at level 4 or less (parent level)
   - **Edge cases**: No block at target level, target level doesn't exist

2. **findPreviousBlockHeader with Target Indent**
   - **What**: Verify backward search respects indentation
   - **Given**: Document with blocks at multiple levels, targetIndentLevel=4
   - **When**: Call `findPreviousBlockHeader(document, startLine, 4)`
   - **Then**: Returns previous block at level 4 or less
   - **Edge cases**: First block at target level, irregular indentation

3. **Indentation Level Boundary Detection**
   - **What**: Verify correct level comparison logic
   - **Given**: Block at level 8, parent at level 4, grandparent at level 0
   - **When**: Search from level 8 with target=8
   - **Then**: Finds level 8 sibling first, then level 4, then level 0
   - **Edge cases**: Exact level match, parent level match

4. **No Optional Parameter Backward Compatibility**
   - **What**: Verify existing calls without parameter still work
   - **Given**: Existing code calling `findNextBlockHeader(doc, line)`
   - **When**: Parameter omitted
   - **Then**: Function behaves as before (finds any next block)
   - **Edge cases**: All existing usage patterns

5. **Nested Block Scenario**
   - **What**: Verify complex nesting navigation
   - **Given**: 
     ```
     def outer():
         def inner1():
             pass
         def inner2():
             pass
     def another():
         pass
     ```
   - **When**: Navigate from `inner1` with target=4
   - **Then**: Finds `inner2` (same level), not `another` (level 0)
   - **Edge cases**: Empty nested blocks, deeply nested

6. **Indentation with Decorators**
   - **What**: Verify decorator indentation doesn't break logic
   - **Given**: Decorator at level 4, function at level 4
   - **When**: Calculate indentation of decorated block
   - **Then**: Uses decorator's indentation (line where block starts)
   - **Edge cases**: Decorator more indented than function

### Test Files

- **`src/test/suite/blockNavigator.test.ts`**:
  - Test suite: Block Navigator Edge Cases
  - Test cases to add: 8 scenarios (symmetric fallback, indentation navigation, decorator handling, multi-line statements)

- **`src/test/suite/blockFinder.test.ts`**:
  - Test suite: Indentation-Aware Block Finding
  - Test cases to add: 6 scenarios (target indent parameter, backward compatibility, complex nesting)

## 5. Design Decisions

- **Optional Parameter for Indentation**: Add `targetIndentLevel?: number` parameter instead of creating new functions
  - **Why**: Maintains backward compatibility with existing code
  - **Alternatives considered**: 
    - Create new functions `findNextBlockAtLevel()` - rejected due to code duplication
    - Replace existing functions entirely - rejected due to breaking changes
  - **Trade-offs**: 
    - Pros: No breaking changes, existing tests continue to pass, cleaner API
    - Cons: Slightly more complex function signature, need to handle undefined case

- **Indentation Search Strategy**: Current level → Parent level → Grandparent level (stop at 0)
  - **Why**: Matches user mental model of code structure (navigate within current scope first)
  - **Alternatives considered**:
    - Only same level - rejected (too restrictive, no fallback)
    - All levels mixed - rejected (current broken behavior)
    - Breadth-first across all levels - rejected (confusing navigation order)
  - **Trade-offs**:
    - Pros: Predictable navigation, respects code structure, matches IDE behavior
    - Cons: More complex logic, requires tracking indentation boundaries

- **Fallback to Document Edges**: Both directions go to document boundary (line 0 or last line)
  - **Why**: Symmetric, predictable, matches text editor conventions
  - **Alternatives considered**:
    - Stay in place (current next behavior) - rejected (asymmetric, confusing)
    - Go to first/last block - rejected (inconsistent with document boundaries)
  - **Trade-offs**:
    - Pros: Consistent behavior, clear visual feedback, matches cursor navigation patterns
    - Cons: None identified

- **Use Existing Utilities**: Leverage `levelOfIndentation()`, `isBlockHeader()`, `skipMultiLineStatement()`
  - **Why**: These utilities already exist and are tested, reduces implementation risk
  - **Alternatives considered**: None - these are the correct tools for the job
  - **Trade-offs**:
    - Pros: Code reuse, proven reliability, faster implementation
    - Cons: None
