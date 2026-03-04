# Technical Specification: Navigation Test Helper Facility

## 1. Files to Modify

- **`src/test/suite/blockNavigator.test.ts`**: Refactor all 9 tests to use new test helper facility
  - **Current behavior**: Each test manually creates MockTextDocument, vscode.Position, calls navigation function, asserts result.line (~8-15 lines per test)
  - **New behavior**: Each test uses DocumentState and expectCursorPosition helper (~2-3 lines per test)
  - **Functions/sections affected**: All 9 test cases in the suite
  - **Estimated reduction**: From ~143 lines to ~50 lines total

## 2. Files to Create

- **`src/test/suite/navigation/testHelpers.ts`**: New test helper facility for navigation tests
  - **Purpose**: Provide DocumentState reuse and expectCursorPosition function to reduce boilerplate
  - **Responsibilities**:
    - Re-export DocumentState from smartExecute/testHelpers.ts
    - Implement expectCursorPosition function for testing navigation functions
    - Handle special values ('first-line', 'last-line') for expected positions
    - Support optional character parameter for cursor column position

- **`src/test/suite/navigation/testHelpers.test.ts`**: Test suite for the test helper facility
  - **Purpose**: Verify expectCursorPosition works correctly before using in production tests
  - **Responsibilities**: Test all expectCursorPosition behaviors including edge cases

## 3. Implementation Approach

### What to Implement

#### **testHelpers.ts - DocumentState Reuse**
- **Location**: `src/test/suite/navigation/testHelpers.ts`
- **Approach**: Import and re-export DocumentState class from smartExecute/testHelpers.ts
- **Implementation**:
  ```typescript
  export { DocumentState } from '../smartExecute/testHelpers';
  ```
- **Rationale**: Avoid duplication, maintain single source of truth, follow DRY principle

#### **testHelpers.ts - expectCursorPosition Function**
- **Location**: `src/test/suite/navigation/testHelpers.ts`
- **Approach**: Create assertion function following smartExecute pattern but adapted for navigation
- **Signature**:
  ```typescript
  export interface ExpectCursorPositionOptions {
      character?: number;  // Optional cursor column position (default: 0)
  }
  
  export function expectCursorPosition(
      state: DocumentState,
      direction: 'next' | 'previous',
      expectedLine: number | 'first-line' | 'last-line',
      options?: ExpectCursorPositionOptions
  ): void
  ```
- **Algorithm**:
  1. Create MockTextDocument from state.content
  2. Create vscode.Position from state.cursorLine and state.cursorChar
  3. Resolve special values:
     - 'first-line' → 0
     - 'last-line' → doc.lineCount - 1
  4. Call appropriate navigation function based on direction:
     - 'next' → jumpNextBlock(document, position)
     - 'previous' → jumpPreviousBlock(document, position)
  5. Assert result.line matches expectedLine (resolved)
  6. Assert result.character matches options.character (if provided) or 0 (default)
- **Tools/Utilities to use**:
  - DocumentState from smartExecute/testHelpers.ts
  - MockTextDocument from ../mocks.ts
  - vscode.Position from vscode API
  - jumpNextBlock/jumpPreviousBlock from navigation/blockNavigator
  - assert.strictEqual from assert module
- **Edge cases to handle**:
  - Empty documents (lineCount = 1)
  - Single-line documents
  - Expected character position at 0 (default)
  - Custom character positions
  - Navigation beyond document bounds (already handled by navigation functions)
  - Special values when document has only 1 line ('first-line' and 'last-line' both resolve to 0)

#### **blockNavigator.test.ts - Test Refactoring**
- **Location**: `src/test/suite/blockNavigator.test.ts`
- **Approach**: Replace manual setup/assertion with expectCursorPosition calls
- **Pattern transformation**:
  ```typescript
  // BEFORE (10-15 lines):
  test('should navigate to same-level next block', () => {
      const content = `def outer():
      def inner1():
          pass
      
      def inner2():
          pass`;
      const doc = new MockTextDocument(content);
      const position = new vscode.Position(1, 0);
      
      const result = jumpNextBlock(doc, position);
      
      assert.strictEqual(result.line, 5);
  });
  
  // AFTER (2-3 lines):
  test('should navigate to same-level next block', () => {
      const state = new DocumentState(`def outer():
      def inner1():
          pass
      
      def inner2():
          pass`, 1, 0);
      expectCursorPosition(state, 'next', 5);
  });
  ```
- **Functions/sections affected**:
  - All 9 tests in the suite
  - Import statements (add DocumentState, expectCursorPosition; remove vscode.Position if no longer needed)
- **Edge cases to verify**:
  - All existing tests must pass unchanged
  - Test count remains 9
  - Test names remain unchanged for continuity

### External Dependencies

**Decision: Build vs Buy**
- [x] No new external dependencies needed
- [ ] New dependency required: N/A

**Rationale**: All required infrastructure exists in the codebase:
- DocumentState class already exists in smartExecute/testHelpers.ts
- MockTextDocument already exists in mocks.ts
- Navigation functions already exist in blockNavigator.ts
- vscode.Position is part of VS Code API

## 4. Test Strategy

### What to Test

#### **testHelpers.test.ts - Testing the Test Helpers**

1. **expectCursorPosition with numeric expectedLine**
   - **What**: Verify expectCursorPosition correctly asserts numeric line positions
   - **Given**: DocumentState with content and cursor position, direction 'next' or 'previous'
   - **When**: Calling expectCursorPosition with numeric expectedLine (e.g., 5)
   - **Then**: Asserts result.line equals expectedLine without error
   - **Edge cases**: Line 0, line at document end, middle lines

2. **expectCursorPosition with 'first-line' special value**
   - **What**: Verify 'first-line' resolves to line 0
   - **Given**: DocumentState with content, direction 'previous'
   - **When**: Calling expectCursorPosition with 'first-line'
   - **Then**: Asserts result.line equals 0
   - **Edge cases**: Single-line document (first-line = 0)

3. **expectCursorPosition with 'last-line' special value**
   - **What**: Verify 'last-line' resolves to lineCount - 1
   - **Given**: DocumentState with multi-line content, direction 'next'
   - **When**: Calling expectCursorPosition with 'last-line'
   - **Then**: Asserts result.line equals doc.lineCount - 1
   - **Edge cases**: Single-line document (last-line = 0), empty document

4. **expectCursorPosition with optional character parameter**
   - **What**: Verify character parameter asserts result.character
   - **Given**: DocumentState, direction, expectedLine
   - **When**: Calling expectCursorPosition with options.character = 5
   - **Then**: Asserts result.character equals 5
   - **Edge cases**: character = 0 (default), character > 0

5. **expectCursorPosition with 'next' direction**
   - **What**: Verify 'next' calls jumpNextBlock
   - **Given**: DocumentState at line 0 in multi-block document
   - **When**: Calling expectCursorPosition with direction 'next'
   - **Then**: Asserts result.line is next block line
   - **Edge cases**: At last block (falls back to last-line)

6. **expectCursorPosition with 'previous' direction**
   - **What**: Verify 'previous' calls jumpPreviousBlock
   - **Given**: DocumentState at line > 0 in multi-block document
   - **When**: Calling expectCursorPosition with direction 'previous'
   - **Then**: Asserts result.line is previous block line
   - **Edge cases**: At first block (falls back to first-line)

7. **expectCursorPosition default character behavior**
   - **What**: Verify character defaults to 0 when not provided
   - **Given**: DocumentState, direction, expectedLine, no options
   - **When**: Calling expectCursorPosition without options
   - **Then**: Asserts result.character equals 0
   - **Edge cases**: None

8. **expectCursorPosition assertion failure**
   - **What**: Verify assertion fails with wrong expected line
   - **Given**: DocumentState expecting line 5
   - **When**: Navigation returns line 3
   - **Then**: assert.strictEqual throws AssertionError
   - **Edge cases**: Wrong character, wrong direction

### Test Files

- **`src/test/suite/navigation/testHelpers.test.ts`**:
  - **Test suite**: "Navigation Test Helpers Test Suite"
  - **Test cases to add**:
    1. "should export DocumentState from smartExecute"
    2. "should assert numeric expectedLine for next direction"
    3. "should assert numeric expectedLine for previous direction"
    4. "should resolve 'first-line' to line 0"
    5. "should resolve 'last-line' to lineCount - 1"
    6. "should handle 'first-line' and 'last-line' in single-line document"
    7. "should assert character position when provided"
    8. "should default character to 0 when not provided"
    9. "should throw on assertion failure"

- **`src/test/suite/blockNavigator.test.ts`** (refactored):
  - **Test suite**: "Block Navigator Test Suite" (unchanged)
  - **Test cases**: Same 9 tests, refactored to use expectCursorPosition
  - **No new tests**: Test count remains 9

## 5. Design Decisions

- **Separate testHelpers.ts file**: Follows smartExecute pattern, clear module boundaries, easier maintenance
- **Re-export DocumentState**: Avoids duplication, single source of truth, simple one-line export
- **Options object pattern**: Extensible, clear named parameters, consistent with smartExecute/testHelpers
- **String literals for special values**: Simple, readable, self-documenting ('first-line', 'last-line')
- **Test the helpers**: Ensures correctness, documents behavior, follows best practice
- **Function naming**: `expectCursorPosition` - specific, consistent with `expectSelection` pattern
- **Parameter order**: `(state, direction, expectedLine, options?)` - follows Given-When-Then flow
- **Default character to 0**: Matches navigation function behavior, reduces boilerplate
- **navigation/ subdirectory**: Consistent with smartExecute structure, scalable for future modules
- **Standard assert messages**: Built-in messages sufficient, simpler implementation

## 6. Implementation Steps

1. Create `src/test/suite/navigation/` directory
2. Create `src/test/suite/navigation/testHelpers.ts` with:
   - DocumentState re-export
   - ExpectCursorPositionOptions interface
   - expectCursorPosition function (resolves special values, calls navigation, asserts position)
3. Create `src/test/suite/navigation/testHelpers.test.ts` with 9 tests
4. Move `blockNavigator.test.ts` to `src/test/suite/navigation/`
5. Refactor all 9 tests to use expectCursorPosition
6. Run `npm run test:unit` to verify
7. Run `npm run lint` and `npm run compile` for quality checks

## 7. Success Criteria

- Boilerplate reduced from ~15 lines to ~2-3 lines per test
- Test count unchanged (9 tests)
- All tests pass
- Code quality checks pass (lint, compile)
- Test helpers have their own test suite
