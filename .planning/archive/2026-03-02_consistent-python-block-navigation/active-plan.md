# Implementation Plan: Consistent Python Block Navigation

## Overview
**Type**: Bugfix (2 bugs to fix with comprehensive test coverage)  
**Test Command**: `npm run test:unit`  
**Test Files**: 
- `src/test/suite/blockNavigator.test.ts` (8 new test scenarios)
- `src/test/suite/blockFinder.test.ts` (6 new test scenarios)

**Source Files**:
- `src/navigation/blockNavigator.ts` (fix asymmetric fallback + update to use indentation)
- `src/navigation/blockFinder.ts` (add optional indentation parameter)

---

## Pre-Implementation Verification

- [ ] **VERIFY BASELINE**: Run `npm run compile && npm run lint`. **Expect pass** (codebase is in good state)
- [ ] **VERIFY TESTS**: Run `npm run test:unit`. **Expect pass** (all existing tests pass before making changes)
- [ ] **NOTE**: Document any failing tests before starting implementation

---

## Bug #1: Asymmetric Fallback Behavior

### Cycle 1: Fix Next Block Fallback
- [ ] **RED**: Create failing test in `src/test/suite/blockNavigator.test.ts` for symmetric fallback at document end (cursor on last block → jump next → should go to last line, not stay in place)
- [ ] **VERIFY FAIL**: Run `npm run test:unit`. **Expect failure** (confirms bug exists)
- [ ] **GREEN**: Fix `jumpNextBlock()` in `src/navigation/blockNavigator.ts` (lines 26-42) - change fallback from `currentPosition` to `new vscode.Position(document.lineCount - 1, 0)`
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass** (bug is fixed)
- [ ] **REFACTOR**: No refactoring needed for this simple fix
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

### Cycle 2: Verify Previous Block Fallback
- [ ] **RED**: Create test in `src/test/suite/blockNavigator.test.ts` for symmetric fallback at document start (cursor on first block → jump previous → should go to line 0) - this should already pass
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass** (already correct behavior)
- [ ] **GREEN**: No code changes needed
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

---

## Bug #2: Indentation Boundary Not Respected

### Cycle 3: Add Indentation Parameter to findNextBlockHeader
- [ ] **RED**: Create failing test in `src/test/suite/blockFinder.test.ts` for `findNextBlockHeader` with `targetIndentLevel` parameter - test should find next block at same/less indentation
- [ ] **VERIFY FAIL**: Run `npm run test:unit`. **Expect failure** (parameter doesn't exist yet)
- [ ] **GREEN**: Update `findNextBlockHeader()` in `src/navigation/blockFinder.ts` (lines 109-125):
  - Add optional parameter `targetIndentLevel?: number`
  - When provided, only return blocks at `<= targetIndentLevel`
  - Use `levelOfIndentation()` to check candidate blocks
  - Maintain backward compatibility (undefined = any level)
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**
- [ ] **REFACTOR**: Extract indentation level checking into helper if logic becomes complex
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

### Cycle 4: Add Indentation Parameter to findPreviousBlockHeader
- [ ] **RED**: Create failing test in `src/test/suite/blockFinder.test.ts` for `findPreviousBlockHeader` with `targetIndentLevel` parameter - test should find previous block at same/less indentation
- [ ] **VERIFY FAIL**: Run `npm run test:unit`. **Expect failure** (parameter doesn't exist yet)
- [ ] **GREEN**: Update `findPreviousBlockHeader()` in `src/navigation/blockFinder.ts` (lines 133-149):
  - Add optional parameter `targetIndentLevel?: number`
  - When provided, only return blocks at `<= targetIndentLevel`
  - Use `levelOfIndentation()` to validate
  - Maintain backward compatibility
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**
- [ ] **REFACTOR**: Ensure both find functions share consistent logic
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

### Cycle 5: Update jumpNextBlock to Use Indentation
- [ ] **RED**: Create failing test in `src/test/suite/blockNavigator.test.ts` for same-level next block navigation (nested function at indent 4 → jump next → should find next block at indent 4, not parent's sibling)
- [ ] **VERIFY FAIL**: Run `npm run test:unit`. **Expect failure** (not using indentation yet)
- [ ] **GREEN**: Update `jumpNextBlock()` in `src/navigation/blockNavigator.ts` (lines 26-42):
  - Get current block's indentation using `levelOfIndentation()`
  - Pass indentation to `findNextBlockHeader()`
  - Maintain symmetric fallback from Cycle 1
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**
- [ ] **REFACTOR**: Extract indentation calculation into helper if used in multiple places
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

### Cycle 6: Update jumpPreviousBlock to Use Indentation
- [ ] **RED**: Create failing test in `src/test/suite/blockNavigator.test.ts` for same-level previous block navigation (nested function at indent 4 → jump previous → should find previous block at indent 4)
- [ ] **VERIFY FAIL**: Run `npm run test:unit`. **Expect failure** (not using indentation yet)
- [ ] **GREEN**: Update `jumpPreviousBlock()` in `src/navigation/blockNavigator.ts` (lines 48-64):
  - Get current block's indentation using `levelOfIndentation()`
  - Pass indentation to `findPreviousBlockHeader()`
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**
- [ ] **REFACTOR**: Ensure both jump functions share consistent indentation handling
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

---

## Additional Test Coverage

### Cycle 7: Edge Cases - Decorator Handling
- [ ] **RED**: Create test in `src/test/suite/blockNavigator.test.ts` for decorator handling (decorated function → navigate → cursor lands on decorator line, not def line)
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass** (should work with existing decorator logic)
- [ ] **GREEN**: No code changes needed unless test fails
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

### Cycle 8: Edge Cases - Multi-line Statements
- [ ] **RED**: Create test in `src/test/suite/blockNavigator.test.ts` for multi-line statement boundaries (navigate across multi-line dictionary → should jump to block headers, not intermediate lines)
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass** (should work with existing multi-line logic)
- [ ] **GREEN**: No code changes needed unless test fails
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

### Cycle 9: Edge Cases - Complex Nesting
- [ ] **RED**: Create test in `src/test/suite/blockFinder.test.ts` for nested block scenario (inner1 → navigate → finds inner2 at same level, not another at parent level)
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass** (should work with indentation logic from Cycles 3-6)
- [ ] **GREEN**: No code changes needed unless test fails
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

### Cycle 10: Edge Cases - Backward Compatibility
- [ ] **RED**: Create test in `src/test/suite/blockFinder.test.ts` for backward compatibility (call `findNextBlockHeader(doc, line)` without parameter → should behave as before)
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass** (optional parameter ensures backward compatibility)
- [ ] **GREEN**: No code changes needed
- [ ] **VERIFY PASS**: Run `npm run test:unit`. **Expect pass**

---

## Test Scenarios Summary

**Block Navigator Tests** (8 scenarios):
1. Symmetric fallback at document end
2. Symmetric fallback at document start
3. Same-level next block navigation
4. Same-level previous block navigation
5. Parent level fallback
6. Decorator handling
7. Mixed indentation document
8. Multi-line statement boundaries

**Block Finder Tests** (6 scenarios):
1. findNextBlockHeader with target indent
2. findPreviousBlockHeader with target indent
3. Indentation level boundary detection
4. No optional parameter backward compatibility
5. Nested block scenario
6. Indentation with decorators

---

## Quality Checklist
- [x] Correct template used (Red-Green-Refactor for bugfix)
- [x] Test command matches AGENTS.md (`npm run test:unit`)
- [x] Cycles are appropriately sized (1 logical unit per cycle)
- [x] Test files identified (blockNavigator.test.ts, blockFinder.test.ts)
- [x] Verification steps included (RED → VERIFY FAIL → GREEN → VERIFY PASS → REFACTOR → VERIFY PASS)
- [x] Pre-implementation verification added (ensure baseline tests pass)
