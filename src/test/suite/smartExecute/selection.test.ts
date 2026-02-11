import * as assert from 'assert';

import {
    findEndLineOfPythonCodeBlock,
    findNextCodeLine,
    findStartLineOfPythonCodeBlock,
    isDecorator,
} from '../../../smartExecute/selection';
import { MockTextDocument } from '../mocks';

suite('Smart Select Logic Test Suite', () => {
    test('Exports should exist', () => {
        assert.ok(findStartLineOfPythonCodeBlock, 'findStartLineOfPythonCodeBlock is not exported');
        assert.ok(findEndLineOfPythonCodeBlock, 'findEndLineOfPythonCodeBlock is not exported');
        assert.ok(isDecorator, 'isDecorator is not exported');
        assert.ok(findNextCodeLine, 'findNextCodeLine is not exported');
    });

    test('isDecorator basic', () => {
        assert.strictEqual(isDecorator('@dataclass'), true);
        assert.strictEqual(isDecorator('def foo():'), false);
    });

    suite('Decorator Tests', () => {
        test('Single decorator before function', () => {
            const content = '@timer\ndef some_function(x):\n    return x\n';
            const doc = new MockTextDocument(content);

            // Simulate the smartSelect logic: start from the function definition
            const currentLine = doc.lineAt(1);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should include decorator line');
            assert.strictEqual(endLine.lineNumber, 2, 'Should include entire function');
        });

        test('Multiple decorators before function', () => {
            const content = '@contextmanager\n@decorator\ndef my_context():\n    yield 1\n';
            const doc = new MockTextDocument(content);

            // Simulate the smartSelect logic: start from the function definition
            const currentLine = doc.lineAt(2);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should include all decorator lines');
            assert.strictEqual(endLine.lineNumber, 3, 'Should include entire function');
        });

        test('Decorator before class', () => {
            const content = '@dataclass\nclass test:\n    """Docstring"""\n    def method():\n        pass\n';
            const doc = new MockTextDocument(content);

            // Simulate the smartSelect logic: start from the class definition
            const currentLine = doc.lineAt(1);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should include decorator line');
            assert.strictEqual(endLine.lineNumber, 4, 'Should include entire class');
        });
    });

    suite('Function Definition Tests', () => {
        test('Simple function', () => {
            const content = 'def test():\n    return ""\n\n';
            const doc = new MockTextDocument(content);

            const startLine = findStartLineOfPythonCodeBlock(doc.lineAt(0), doc);
            const endLine = findEndLineOfPythonCodeBlock(startLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at function definition');
            assert.strictEqual(endLine.lineNumber, 1, 'Should end at last function line');
        });

        test('Multi-line function parameters', () => {
            const content = 'def function_with_a_lot_of_params(\n    very_long_argument_name="value", so_that_we_need_a_line_break="value"\n):\n    pass\n';
            const doc = new MockTextDocument(content);

            const startLine = findStartLineOfPythonCodeBlock(doc.lineAt(0), doc);
            const endLine = findEndLineOfPythonCodeBlock(startLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at function definition');
            assert.strictEqual(endLine.lineNumber, 3, 'Should include function body');
        });

        test('Function with nested blocks', () => {
            const content = 'def some_function(x):\n    for i in range(0, 10):\n        # asd\n        print(i)\n    return x\n';
            const doc = new MockTextDocument(content);

            const startLine = findStartLineOfPythonCodeBlock(doc.lineAt(0), doc);
            const endLine = findEndLineOfPythonCodeBlock(startLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at function definition');
            assert.strictEqual(endLine.lineNumber, 4, 'Should include all nested blocks');
        });
    });

    suite('Class Definition Tests', () => {
        test('Class with docstring and method', () => {
            const content = 'class test:\n    """Docstring\n    \n    multi line\n    """\n\n    def method():\n        breakpoint()\n        pass\n';
            const doc = new MockTextDocument(content);

            const startLine = findStartLineOfPythonCodeBlock(doc.lineAt(0), doc);
            const endLine = findEndLineOfPythonCodeBlock(startLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at class definition');
            assert.strictEqual(endLine.lineNumber, 8, 'Should include entire class');
        });

        test('Class with multiple methods', () => {
            const content = 'class test:\n    def __init__(self):\n        self.value = 0\n\n    def method(self):\n        return self.value\n';
            const doc = new MockTextDocument(content);

            const startLine = findStartLineOfPythonCodeBlock(doc.lineAt(0), doc);
            const endLine = findEndLineOfPythonCodeBlock(startLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at class definition');
            assert.strictEqual(endLine.lineNumber, 5, 'Should include all methods');
        });
    });

    suite('Control Flow Tests', () => {
        test('Simple if block', () => {
            const content = 'if False:\n    print("if")\nelif True:\n    print("else if")\nelse:\n    print("Else")\n';
            const doc = new MockTextDocument(content);

            const currentLine = doc.lineAt(0);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at if statement');
            assert.strictEqual(endLine.lineNumber, 5, 'Should include all if/elif/else branches');
        });

        test('try/except/finally block', () => {
            const content = 'try:\n    print("Yay")\nexcept Exception:\n    print("Oh no!")\nfinally:\n    print("finally")\n';
            const doc = new MockTextDocument(content);

            const currentLine = doc.lineAt(0);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at try statement');
            assert.strictEqual(endLine.lineNumber, 5, 'Should include try/except/finally blocks');
        });

        test('Nested control flow', () => {
            const content = 'if True:\n    try:\n        print("nested")\n    except:\n        print("error")\nelse:\n    print("else")\n';
            const doc = new MockTextDocument(content);

            const currentLine = doc.lineAt(0);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at if statement');
            assert.strictEqual(endLine.lineNumber, 6, 'Should include nested try/except');
        });

        test('Single except without finally', () => {
            const content = 'try:\n    risky_operation()\nexcept ValueError:\n    handle_error()\n';
            const doc = new MockTextDocument(content);

            const currentLine = doc.lineAt(0);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at try statement');
            assert.strictEqual(endLine.lineNumber, 3, 'Should include try/except block');
        });
    });

    suite('Multi-line Construct Tests', () => {
        test('Multi-line dictionary', () => {
            const content = 'x = {\n    "key1": "value",\n    "key2": "value",\n    "key3": "value",\n    "key4": "value",\n    "key5": "value",\n}\n';
            const doc = new MockTextDocument(content);

            const currentLine = doc.lineAt(0);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at variable assignment');
            assert.strictEqual(endLine.lineNumber, 6, 'Should include entire dictionary');
        });

        test('Multi-line list comprehension', () => {
            const content = 'another_long_name_here = 1\n[a_very_long_name_again + another_long_name_here for a_very_long_name_again in range(10)]\n';
            const doc = new MockTextDocument(content);

            const currentLine = doc.lineAt(1);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 1, 'Should start at comprehension');
            assert.strictEqual(endLine.lineNumber, 1, 'Should end at comprehension line');
        });

        test('Multi-line docstring in class', () => {
            const content = 'class test:\n    """Docstring\n    \n    multi line\n    """\n\n    def method():\n        breakpoint()\n        pass\n';
            const doc = new MockTextDocument(content);

            const currentLine = doc.lineAt(0);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at class definition');
            assert.strictEqual(endLine.lineNumber, 8, 'Should include docstring and methods');
        });

        test('Multi-line function call with parentheses', () => {
            const content = 'some_function(\n    arg1=value1,\n    arg2=value2,\n    arg3=value3\n)\n';
            const doc = new MockTextDocument(content);

            const currentLine = doc.lineAt(0);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at function call');
            assert.strictEqual(endLine.lineNumber, 4, 'Should include all parentheses');
        });

        test('With statement context manager', () => {
            const content = 'with my_context() as x:\n    print(x)\n';
            const doc = new MockTextDocument(content);

            const currentLine = doc.lineAt(0);
            const endLine = findEndLineOfPythonCodeBlock(currentLine, doc);
            const startLine = findStartLineOfPythonCodeBlock(currentLine, doc);

            assert.strictEqual(startLine.lineNumber, 0, 'Should start at with statement');
            assert.strictEqual(endLine.lineNumber, 1, 'Should include with block');
        });
    });

    suite('Stepping Logic Tests', () => {
        test('Skip decorators when finding next code line', () => {
            const content = 'x = 1\n\n@timer\ndef another_function():\n    pass\n';
            const doc = new MockTextDocument(content);

            const firstLine = doc.lineAt(0);
            const nextLine = findNextCodeLine(firstLine, doc);

            assert.strictEqual(nextLine.lineNumber, 3, 'Should skip @timer decorator and find def');
        });

        test('Skip decorators when finding next code line (from function)', () => {
            const content = 'def some_function():\n    pass\n\n@timer\ndef another_function():\n    pass\n';
            const doc = new MockTextDocument(content);

            const firstFunctionLine = doc.lineAt(1);
            const nextLine = findNextCodeLine(firstFunctionLine, doc);

            assert.strictEqual(nextLine.lineNumber, 4, 'Should skip @timer decorator and find def');
        });

        test('Skip comments when finding next code line', () => {
            const content = 'x = 1\n# This is a comment\n# Another comment\ny = 2\n';
            const doc = new MockTextDocument(content);

            const firstLine = doc.lineAt(0);
            const nextLine = findNextCodeLine(firstLine, doc);

            assert.strictEqual(nextLine.lineNumber, 3, 'Should skip comments and find y = 2');
        });

        test('Handle empty lines and whitespace', () => {
            const content = 'x = 1\n\n   \n\t\ny = 2\n';
            const doc = new MockTextDocument(content);

            const firstLine = doc.lineAt(0);
            const nextLine = findNextCodeLine(firstLine, doc);

            assert.strictEqual(nextLine.lineNumber, 4, 'Should skip empty and whitespace lines');
        });

        test('Return last line if no next code found', () => {
            const content = 'x = 1\n\n# comment\n# comment\n';
            const doc = new MockTextDocument(content);

            const firstLine = doc.lineAt(0);
            const nextLine = findNextCodeLine(firstLine, doc);

            assert.strictEqual(nextLine.lineNumber, 4, 'Should return last line if no next code found');
        });

        test('Find next line in complex scenario', () => {
            const content = 'x = 1\n\n@decorator1\n@decorator2\ndef func2():\n    pass\n\n# comment\n\nz = 5\n';
            const doc = new MockTextDocument(content);

            const firstLine = doc.lineAt(0);
            const nextLine = findNextCodeLine(firstLine, doc);

            assert.strictEqual(nextLine.lineNumber, 4, 'Should skip empty lines and decorators');
        });
    });
});
