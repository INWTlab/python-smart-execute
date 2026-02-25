# Example prompts to implement new feature

## Fix test setup

Let' create tests for smartSelect. I think there are none. Possibly we need to add additional mocks. Ideally we don't need to touch existing implementation and add an additional file for testing. We may need to add to the existing mocks. The tests should cover higher level test cases which we want to implement first. We can then migrate all existing test cases in the @src/test/suite/smartExecute/selection.test.ts file, since they are testing implementation details - and don't cover the actual behaviour. We can then remove the tests which don't provide additional value. When you create the guide.md and are done with analyzing the current state you may critisize this task and make a proposition which parts to change. Don't create the tech-spec yet.

## Multiline select

Hi Brain. I want to add a feature to the smart execute logic. When I execute a
multiline statement, I can only do that on the first line - opening statement -
, of the multiline statement. I want to add that we can also recognize a
multiline statement when the cursor is on any line, including the closing line,
of the multiline statement. Simple examples: ("a"\n"b") or
Class(\narg=1\n).method() are multiline statements. Statements like
def/class/if/else etc are block statements and not part of this.

We need to add one important clarification: The block select has priority over
multiline select. First we check if we have a selection by the user. Then we
only send this selection. Then we check if we can do a block select and do that
(no new logic necessary). If not, we check if the cursor is in a multiline
statement (added in this feature) and do the selection of the block as described
in the current tech-spec. If not we execute the current line.

Make sure to test sufficient scenarios when multiline selection should not be
applied, e.g. when we expect to execute a single line. Especially when there are
multiline statements before and after the single line statement, we still expect
the single line to be executer.

Also consider test cases for the multiline selection where
the editor contains blocks and other code before and after the multiline
statement. This is especially important when any form of open/closed parenthesis
detection is happening. It is easy to implement bugs if the tests do not contain
more complex scenarios of an example script. E.g. Consider
@examples/interactiveSession.py to understand what elements can occur together.

Examples:

### Example 1:

```
(
    ""  <- cursor here
)
```

expected: select all lines.

### Example 2:

```
(
    ""
)
(
    "" <- cursor here
)
```

expected: only select second multiline statement where the cursor is placed.


## Bug:

We need to solve a bug in the smart execute. When the cursor is on the opening
part of a multiline statement, e.g. (, and the closing element, e.g. ), is on
the last line in the document, we do not select the final line. This can be
verified not only for multiline statements but for all blocks in smart select.
When I add an empty line after the block, selection works.

Example:

```
( <-- Cursor is here and we miss the final line
    "a"
    "b"
) <-- EOF
```
