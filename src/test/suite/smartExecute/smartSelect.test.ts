import { DocumentState, expectSelection } from './testHelpers';

suite('SmartSelect Behavior Test Suite', () => {
    test('Single line selection when smart selection is disabled', () => {
        const state = new DocumentState('x = 1', 0, 0);
        expectSelection(state, 0, 0, {smartExecute: false});
    });

    test('Function selection with decorators', () => {
        const state = new DocumentState('@timer\ndef some_function(x):\n    return x\n', 1, 0);
        expectSelection(state, 0, 2);
    });

    test('Class selection with decorators', () => {
        const state = new DocumentState('@dataclass\nclass Person:\n    name: str\n    age: int\n', 1, 0);
        expectSelection(state, 0, 3);
    });

    test('Control flow selection (if/elif/else)', () => {
        const state = new DocumentState('if x > 0:\n    print("positive")\nelif x < 0:\n    print("negative")\nelse:\n    print("zero")\n', 0, 0);
        expectSelection(state, 0, 5);
    });

    test('Multi-line statement selection (dictionary)', () => {
        const state = new DocumentState('data = {\n    "key1": "value1",\n    "key2": "value2",\n    "key3": "value3"\n}\n', 0, 0);
        expectSelection(state, 0, 4);
    });

    test('Multi-block document selection (target specific function)', () => {
        const state = new DocumentState('def first_function():\n    pass\n\n@timer\ndef target_function(x):\n    return x\n\ndef last_function():\n    pass\n', 4, 0);
        expectSelection(state, 3, 5);
    });

    test('Edge case: empty lines and comments', () => {
        const state = new DocumentState('def first_function():\n    pass\n\n# This is a comment\n\n@timer\ndef target_function(x):\n    return x\n\n# Another comment\n\ndef last_function():\n    pass\n', 6, 0);
        expectSelection(state, 5, 7);
    });

    suite('Multiline Statement Selection Tests', () => {
        test('Single Line Execution Between Multiline Statements', () => {
            const state = new DocumentState('x = (\n    1 + 2\n)\ny = 3\nz = [\n    4, 5\n]', 3, 0);
            expectSelection(state, 3, 3);
        });

        test('Multiline Statement Surrounded by Blocks and Other Code', () => {
            const state = new DocumentState('def my_func():\n    pass\n\nmy_list = [\n    1,\n    2,\n    3\n]\n\nclass MyClass:\n    pass', 5, 0);
            expectSelection(state, 3, 7);
        });

        test('Nested Multiline Statements', () => {
            const state = new DocumentState('result = my_function(\n    [\n        1, 2,\n        3\n    ],\n    {"key": "value"}\n)', 2, 0);
            expectSelection(state, 0, 6);
        });

        test('Multiline Statements with Strings and Comments', () => {
            const state = new DocumentState('text = (\n    "This is a string with (parentheses)"\n    # This is a comment with [brackets]\n)', 1, 0);
            expectSelection(state, 0, 3);
        });

        test('Cursor on the Closing Line', () => {
            const state = new DocumentState('my_dict = {\n    "a": 1,\n    "b": 2\n}', 3, 0);
            expectSelection(state, 0, 3);
        });

        test('Cursor on the Opening Line', () => {
            const state = new DocumentState('my_tuple = (\n    1,\n    2\n)', 0, 0);
            expectSelection(state, 0, 3);
        });

        test('Complex Interactive Session Elements', () => {
            const state = new DocumentState('@decorator\ndef timer(func, *args, **kw):\n    time_start = time.time()\n    res = func(\n        *args,\n        **kw\n    )\n    return res', 4, 0);
            expectSelection(state, 3, 6);
        });

        test('Multiple Independent Multiline Statements', () => {
            const state = new DocumentState('first_list = [\n    1,\n    2\n]\n\nsecond_list = [\n    3,\n    4\n]', 7, 0);
            expectSelection(state, 5, 8);
        });

        test('Multiline Statement Inside If Block', () => {
            const state = new DocumentState('if True:\n    my_list = [\n        1,\n        2\n    ]\nelse:\n    pass', 1, 0);
            expectSelection(state, 1, 4);
        });
    });
});
