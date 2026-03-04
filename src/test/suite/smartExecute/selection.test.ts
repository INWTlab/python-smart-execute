import { DocumentState, expectSelection } from './testHelpers';

suite('Smart Select Logic Test Suite', () => {
    suite('Decorator Tests', () => {
        test('Single decorator before function', () => {
            const state = new DocumentState('@timer\ndef some_function(x):\n    return x\n', 1, 0);
            expectSelection(state, 0, 2);
        });

        test('Multiple decorators before function', () => {
            const state = new DocumentState('@contextmanager\n@decorator\ndef my_context():\n    yield 1\n', 2, 0);
            expectSelection(state, 0, 3);
        });

        test('Decorator before class', () => {
            const state = new DocumentState('@dataclass\nclass test:\n    """Docstring"""\n    def method():\n        pass\n', 1, 0);
            expectSelection(state, 0, 4);
        });
    });

    suite('Function Definition Tests', () => {
        test('Simple function', () => {
            const state = new DocumentState('def test():\n    return ""\n\n', 0, 0);
            expectSelection(state, 0, 1);
        });

        test('Multi-line function parameters', () => {
            const state = new DocumentState('def function_with_a_lot_of_params(\n    very_long_argument_name="value", so_that_we_need_a_line_break="value"\n):\n    pass\n', 0, 0);
            expectSelection(state, 0, 3);
        });

        test('Function with nested blocks', () => {
            const state = new DocumentState('def some_function(x):\n    for i in range(0, 10):\n        # asd\n        print(i)\n    return x\n', 0, 0);
            expectSelection(state, 0, 4);
        });
    });

    suite('Class Definition Tests', () => {
        test('Class with docstring and method', () => {
            const state = new DocumentState('class test:\n    """Docstring\n    \n    multi line\n    """\n\n    def method():\n        breakpoint()\n        pass\n', 0, 0);
            expectSelection(state, 0, 8);
        });

        test('Class with multiple methods', () => {
            const state = new DocumentState('class test:\n    def __init__(self):\n        self.value = 0\n\n    def method(self):\n        return self.value\n', 0, 0);
            expectSelection(state, 0, 5);
        });
    });

    suite('Control Flow Tests', () => {
        test('Simple if block', () => {
            const state = new DocumentState('if False:\n    print("if")\nelif True:\n    print("else if")\nelse:\n    print("Else")\n', 0, 0);
            expectSelection(state, 0, 5);
        });

        test('try/except/finally block', () => {
            const state = new DocumentState('try:\n    print("Yay")\nexcept Exception:\n    print("Oh no!")\nfinally:\n    print("finally")\n', 0, 0);
            expectSelection(state, 0, 5);
        });

        test('Nested control flow', () => {
            const state = new DocumentState('if True:\n    try:\n        print("nested")\n    except:\n        print("error")\nelse:\n    print("else")\n', 0, 0);
            expectSelection(state, 0, 6);
        });

        test('Single except without finally', () => {
            const state = new DocumentState('try:\n    risky_operation()\nexcept ValueError:\n    handle_error()\n', 0, 0);
            expectSelection(state, 0, 3);
        });
    });

    suite('Multi-line Construct Tests', () => {
        test('Multi-line dictionary', () => {
            const state = new DocumentState('x = {\n    "key1": "value",\n    "key2": "value",\n    "key3": "value",\n    "key4": "value",\n    "key5": "value",\n}\n', 0, 0);
            expectSelection(state, 0, 6);
        });

        test('Multi-line list comprehension', () => {
            const state = new DocumentState('another_long_name_here = 1\n[a_very_long_name_again + another_long_name_here for a_very_long_name_again in range(10)]\n', 1, 0);
            expectSelection(state, 1, 1);
        });

        test('Multi-line function call with parentheses', () => {
            const state = new DocumentState('some_function(\n    arg1=value1,\n    arg2=value2,\n    arg3=value3\n)\n', 0, 0);
            expectSelection(state, 0, 4);
        });

        test('With statement context manager', () => {
            const state = new DocumentState('with my_context() as x:\n    print(x)\n', 0, 0);
            expectSelection(state, 0, 1);
        });
    });
});
