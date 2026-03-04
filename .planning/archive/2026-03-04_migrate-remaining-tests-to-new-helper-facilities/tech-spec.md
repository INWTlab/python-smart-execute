# Technical Specification: Migrate Remaining Tests to New Helper Facilities

## 1. Files to Modify

- **`src/test/suite/smartExecute/smartSelect.test.ts`** — Remove the nested `'Multiline Statement Selection Tests'` suite (lines 44–181) and replace its 9 OLD-pattern tests with `expectSelection`-based equivalents. Clean up now-unused imports.
  - Current behavior: Mixed — 7 NEW-pattern tests at top level (lines 8–42) plus 9 OLD-pattern tests in a nested suite with `setup`/`teardown` for config mocking, manual `MockTextDocument`, `MockTextEditor`, `vscode.Selection`, and `assert.strictEqual`.
  - New behavior: All 16 tests use `DocumentState` + `expectSelection`. The `'Multiline Statement Selection Tests'` label can optionally be kept as an organisational `suite()` wrapper around the 9 new tests, but `setup`/`teardown` are removed entirely.
  - Imports after: remove `assert`, `vscode`, `smartSelect`, `MockTextDocument`, `MockTextEditor`, `getConfigSmartExecute`. Retain only `DocumentState` and `expectSelection`.

- **`src/test/suite/smartExecute/selection.test.ts`** — Full rewrite. Drop the `'Exports should exist'` test (user decision). Drop the `'Multi-line docstring in class'` test (exact duplicate of `'Class with docstring and method'`). Rewrite the remaining 16 behavioral tests as `expectSelection` calls.
  - Current behavior: 18 tests — 1 exports guard + 17 behavioral — all calling `findStartLineOfPythonCodeBlock`/`findEndLineOfPythonCodeBlock` directly on `MockTextDocument`.
  - New behavior: 16 `expectSelection` tests in the same 5 sub-suites. No internal function imports.
  - Imports after: only `import { DocumentState, expectSelection } from './testHelpers';`

- **`src/test/suite/smartExecute/selectionUtils.test.ts`** — Replace only the `'getMultilineStatementRange Tests'` suite body (lines 88–163) with 7 `expectSelection` tests. All other content is untouched.
  - Current behavior: 7 tests call `getMultilineStatementRange` directly on `MockTextDocument`, assert on raw return value fields.
  - New behavior: Same 7 scenarios verified end-to-end via `smartSelect` through `expectSelection`.
  - Imports after: remove `getMultilineStatementRange` from existing import group; add `import { DocumentState, expectSelection } from './testHelpers';`. Retain `assert`, `vscode`, `isDecorator`, `findNextCodeLine`, `isSelectionEmpty`, `MockTextDocument`.

## 2. Files to Create

None.

## 3. Implementation Approach

### 3.1 `smartSelect.test.ts` — Replace nested suite

Delete lines 44–181 entirely. Add 9 new `test()` blocks inside the top-level suite. Optionally keep the `suite('Multiline Statement Selection Tests', () => { ... })` wrapper as a label — no `setup`/`teardown`.

For each old test: the `content` string and cursor line go into `new DocumentState(content, cursorLine, 0)`. The values from the old `assert.strictEqual` calls become `expectSelection(state, expectedStart, expectedEnd)`.

**9 migrations** (name | content | cursor | start–end):

| Test | Content | Cursor | Start | End |
|------|---------|--------|-------|-----|
| `Single Line Execution Between Multiline Statements` | `'x = (\n    1 + 2\n)\ny = 3\nz = [\n    4, 5\n]'` | 3 | 3 | 3 |
| `Multiline Statement Surrounded by Blocks and Other Code` | `'def my_func():\n    pass\n\nmy_list = [\n    1,\n    2,\n    3\n]\n\nclass MyClass:\n    pass'` | 5 | 3 | 7 |
| `Nested Multiline Statements` | `'result = my_function(\n    [\n        1, 2,\n        3\n    ],\n    {"key": "value"}\n)'` | 2 | 0 | 6 |
| `Multiline Statements with Strings and Comments` | `'text = (\n    "This is a string with (parentheses)"\n    # This is a comment with [brackets]\n)'` | 1 | 0 | 3 |
| `Cursor on the Closing Line` | `'my_dict = {\n    "a": 1,\n    "b": 2\n}'` | 3 | 0 | 3 |
| `Cursor on the Opening Line` | `'my_tuple = (\n    1,\n    2\n)'` | 0 | 0 | 3 |
| `Complex Interactive Session Elements` | `'@decorator\ndef timer(func, *args, **kw):\n    time_start = time.time()\n    res = func(\n        *args,\n        **kw\n    )\n    return res'` | 4 | 3 | 6 |
| `Multiple Independent Multiline Statements` | `'first_list = [\n    1,\n    2\n]\n\nsecond_list = [\n    3,\n    4\n]'` | 7 | 5 | 8 |
| `Multiline Statement Inside If Block` | `'if True:\n    my_list = [\n        1,\n        2\n    ]\nelse:\n    pass'` | 1 | 1 | 4 |

**Edge cases to preserve exactly:**
- `Complex Interactive Session Elements`: cursor=4 (`*args,`) selects the inner `res = func(...)` call (lines 3–6), not the entire decorated function (lines 0–7). The cursor line is the key discriminator.
- `Multiline Statement Inside If Block`: cursor=1 (`my_list = [`) selects the indented multiline list (lines 1–4), not the outer `if`/`else` (lines 0–6).

---

### 3.2 `selection.test.ts` — Full rewrite

Write a new file from scratch. Suite name `'Smart Select Logic Test Suite'`. Five sub-suites kept by name. One import line only.

**Drops:**
- `'Exports should exist'` — user decision, no coverage loss.
- `'Multi-line docstring in class'` — identical content and expected range to `'Class with docstring and method'`; exact duplicate.

**16 migrations** (name | content | cursor | start–end):

*Decorator Tests (3):*
1. `Single decorator before function` | `'@timer\ndef some_function(x):\n    return x\n'` | 1 | 0 | 2
2. `Multiple decorators before function` | `'@contextmanager\n@decorator\ndef my_context():\n    yield 1\n'` | 2 | 0 | 3
3. `Decorator before class` | `'@dataclass\nclass test:\n    """Docstring"""\n    def method():\n        pass\n'` | 1 | 0 | 4

*Function Definition Tests (3):*
4. `Simple function` | `'def test():\n    return ""\n\n'` | 0 | 0 | 1
5. `Multi-line function parameters` | `'def function_with_a_lot_of_params(\n    very_long_argument_name="value", so_that_we_need_a_line_break="value"\n):\n    pass\n'` | 0 | 0 | 3
6. `Function with nested blocks` | `'def some_function(x):\n    for i in range(0, 10):\n        # asd\n        print(i)\n    return x\n'` | 0 | 0 | 4

*Class Definition Tests (2):*
7. `Class with docstring and method` | `'class test:\n    """Docstring\n    \n    multi line\n    """\n\n    def method():\n        breakpoint()\n        pass\n'` | 0 | 0 | 8
8. `Class with multiple methods` | `'class test:\n    def __init__(self):\n        self.value = 0\n\n    def method(self):\n        return self.value\n'` | 0 | 0 | 5

*Control Flow Tests (4):*
9. `Simple if block` | `'if False:\n    print("if")\nelif True:\n    print("else if")\nelse:\n    print("Else")\n'` | 0 | 0 | 5
10. `try/except/finally block` | `'try:\n    print("Yay")\nexcept Exception:\n    print("Oh no!")\nfinally:\n    print("finally")\n'` | 0 | 0 | 5
11. `Nested control flow` | `'if True:\n    try:\n        print("nested")\n    except:\n        print("error")\nelse:\n    print("else")\n'` | 0 | 0 | 6
12. `Single except without finally` | `'try:\n    risky_operation()\nexcept ValueError:\n    handle_error()\n'` | 0 | 0 | 3

*Multi-line Construct Tests (4 of 5 — one duplicate dropped):*
13. `Multi-line dictionary` | `'x = {\n    "key1": "value",\n    "key2": "value",\n    "key3": "value",\n    "key4": "value",\n    "key5": "value",\n}\n'` | 0 | 0 | 6
14. `Multi-line list comprehension` | `'another_long_name_here = 1\n[a_very_long_name_again + another_long_name_here for a_very_long_name_again in range(10)]\n'` | 1 | 1 | 1
15. `Multi-line function call with parentheses` | `'some_function(\n    arg1=value1,\n    arg2=value2,\n    arg3=value3\n)\n'` | 0 | 0 | 4
16. `With statement context manager` | `'with my_context() as x:\n    print(x)\n'` | 0 | 0 | 1

**Edge cases:**
- Test 4 (`Simple function`): content has trailing `'\n\n'`. `expectSelection`'s text derivation slices `[0, 2)` → `['def test():', '    return ""']` — no trailing newline problem.
- Test 14 (`Multi-line list comprehension`): brackets open and close on line 1 (balanced on one line), so `getMultilineStatementRange` returns `undefined`. `smartSelect` falls through to block selection. Since line 1 is not a block header and line 0 is a plain assignment, both `findStart` and `findEnd` return line 1. `expectSelection(state, 1, 1)` is correct.

---

### 3.3 `selectionUtils.test.ts` — Replace `getMultilineStatementRange` suite only

Delete lines 88–163. Add a new `suite('getMultilineStatementRange Tests', () => { ... })` in its place with 7 tests. Update imports only.

**7 migrations** (name | content | cursor | start–end):

1. `Single line returns undefined` | `'x = 1\ny = 2\nz = 3'` | 1 | 1 | 1
2. `Cursor on opening line` | `'x = (\n    1 + 2\n)'` | 0 | 0 | 2
3. `Cursor on middle line` | `'x = (\n    1 + 2\n)'` | 1 | 0 | 2
4. `Cursor on closing line` | `'x = (\n    1 + 2\n)'` | 2 | 0 | 2
5. `Nested brackets` | `'result = my_function(\n    [\n        1, 2,\n        3\n    ],\n    {"key": "value"}\n)'` | 2 | 0 | 6
6. `Strings and comments with brackets` | `'text = (\n    "This is a string with (parentheses)"\n    # This is a comment with [brackets]\n)'` | 1 | 0 | 3
7. `Multiple independent statements` | `'first_list = [\n    1,\n    2\n]\n\nsecond_list = [\n    3,\n    4\n]'` | 6 | 5 | 8

**Import change**: Remove `getMultilineStatementRange` from the destructured import of `'../../../smartExecute/selection'`. Add a new line: `import { DocumentState, expectSelection } from './testHelpers';`

**Why `findNextCodeLine` tests stay unchanged**: `findNextCodeLine` is called only by `stepCursor()` for cursor advancement after execution. It is not called by `smartSelect()`. `expectSelection` cannot exercise it. The 6 existing direct-call tests are the correct pattern for this function.

### External Dependencies

- [x] No new external dependencies needed.

## 4. Test Strategy

This is a test refactoring — no new production behaviors are introduced. The strategy is coverage equivalence: every scenario in the old tests has a corresponding new test with the same content, cursor position, and expected selection range.

**Verification**: Run `npm run test:unit` after each file is modified. This catches transcription errors file-by-file.

### Test Scenarios (Given/When/Then)

1. **Multiline selection — single line between two constructs**
   - Given: `'x = (\n    1 + 2\n)\ny = 3\nz = [\n    4, 5\n]'`, cursor at line 3 (`y = 3`)
   - When: `smartSelect` is called
   - Then: selection is line 3–3

2. **Nested brackets — outermost range selected**
   - Given: multi-level nested call, cursor at line 2 inside inner `[...]`
   - When: `smartSelect` is called
   - Then: selection is lines 0–6 (outermost parens)

3. **Cursor on boundary lines selects full bracket construct**
   - Given: `'my_tuple = (\n    1,\n    2\n)'`, cursor at line 0 (opening) or line 3 (closing)
   - When: `smartSelect` is called
   - Then: selection is lines 0–3 in both cases

4. **Decorated function — decorator included in selection start**
   - Given: `'@timer\ndef some_function(x):\n    return x\n'`, cursor at line 1 (`def`)
   - When: `smartSelect` is called
   - Then: selection starts at line 0 (decorator), ends at line 2

5. **Control flow blocks — full branch chains selected**
   - Given: if/elif/else, try/except/finally, or nested variants; cursor at line 0
   - When: `smartSelect` is called
   - Then: selection covers all branches to the last body line

6. **Inner multiline call in function body — not whole function selected**
   - Given: decorated function containing `res = func(\n    *args,\n    **kw\n)`, cursor at `*args,` (line 4)
   - When: `smartSelect` is called
   - Then: selection is lines 3–6 (inner call only), not lines 0–7

7. **Multiple independent constructs — only the cursor's construct selected**
   - Given: two separate lists; cursor inside second list
   - When: `smartSelect` is called
   - Then: selection covers second list only

8. **Single-line list comprehension — treated as single line**
   - Given: `'another_long_name_here = 1\n[...comprehension on one line...]\n'`, cursor at line 1
   - When: `smartSelect` is called
   - Then: selection is line 1–1 (brackets balanced on same line, no multiline expand)

### Test Files

- `src/test/suite/smartExecute/smartSelect.test.ts`: suite `'SmartSelect Behavior Test Suite'` — replace 9 old tests with 9 new `expectSelection` tests
- `src/test/suite/smartExecute/selection.test.ts`: suite `'Smart Select Logic Test Suite'` — full rewrite, 16 `expectSelection` tests across 5 sub-suites
- `src/test/suite/smartExecute/selectionUtils.test.ts`: suite `'getMultilineStatementRange Tests'` — replace 7 old tests with 7 `expectSelection` tests

## 5. Design Decisions

- **Drop `'Exports should exist'` in `selection.test.ts`**: User explicitly requested this. Internal functions are exercised implicitly by every `expectSelection` call (which calls `smartSelect`, which calls them). No coverage loss.

- **Drop duplicate `'Multi-line docstring in class'`**: Exact duplicate of `'Class with docstring and method'` — same content string, same cursor, same expected range (0–8). One test is sufficient.

- **Keep `findNextCodeLine` tests in old pattern**: `findNextCodeLine` is not reachable through `smartSelect` — it belongs to `stepCursor`. Creating a `expectCursorStep` helper to replace these is out of scope (story prohibits new helpers). The 6 existing direct-call tests are appropriate for this utility.

- **No new test helper functions**: Story explicitly disallows new abstractions. All changes use only the existing `DocumentState` + `expectSelection` from `testHelpers.ts`.

- **No production code changes**: Pure test refactoring. `selection.ts`, `selectionUtils.ts`, and all other source files are untouched.

- **Recommended cycle order**: `selectionUtils.test.ts` first (smallest surgical change), then `selection.test.ts` (largest mechanical rewrite), then `smartSelect.test.ts` (remove nested suite). Run `npm run test:unit` after each to catch errors early.
