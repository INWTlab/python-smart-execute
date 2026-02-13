# Example prompts to implement new feature

## Initial prompt

Hi Brain. I want to add a feature to the smart execute logic. When I execute a
multiline statement, I can only do that on the first line - opening statement -
, of the multiline statement. I want to add that we can also recognize a
multiline statement when the cursor is on any line, including the closing line,
of the multiline statement. Simple examples: ("a"\n"b") or
Class(\narg=1\n).method() are multiline statements. Statements like
def/class/if/else etc are block statements and not part of this.



## Bug:

We need to solve a bug in the smart execute. When the cursor is on the opening
part of a multiline statement, e.g. (, and the closing element, e.g. ), is on
the last line in the document, we do not select the final line. When I add an
empty line after the block, selection works.

Example:

```
( <-- Cursor is here and we miss the final line
    "a"
    "b"
) <-- EOF
```
