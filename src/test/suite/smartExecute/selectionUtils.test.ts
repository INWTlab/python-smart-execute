import * as assert from 'assert';
import * as vscode from 'vscode';
import {
    isDecorator,
    findNextCodeLine,
    getMultilineStatementRange,
    isSelectionEmpty
} from '../../../smartExecute/selection';
import { MockTextDocument } from '../mocks';

suite('Selection Utils Test Suite', () => {
    test('isDecorator basic', () => {
        assert.strictEqual(isDecorator('@dataclass'), true);
        assert.strictEqual(isDecorator('def foo():'), false);
    });

    test('isDecorator with various decorator styles', () => {
        assert.strictEqual(isDecorator('@dataclass'), true);
        assert.strictEqual(isDecorator('@timer'), true);
        assert.strictEqual(isDecorator('@decorator(arg)'), true);
        assert.strictEqual(isDecorator('def function():'), false);
        assert.strictEqual(isDecorator('class Test:'), false);
        assert.strictEqual(isDecorator('x = 1'), false);
        assert.strictEqual(isDecorator('# @comment'), false);
    });

    suite('findNextCodeLine Tests', () => {
        test('Skip decorators when finding next code line', () => {
            const content = 'x = 1\n\n@timer\ndef another_function():\n    pass';
            const doc = new MockTextDocument(content);
            const firstLine = doc.lineAt(0);
            const nextLine = findNextCodeLine(firstLine, doc);
            
            assert.strictEqual(nextLine.lineNumber, 3);
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

    suite('getMultilineStatementRange Tests', () => {
        test('Single line returns undefined', () => {
            const content = 'x = 1\ny = 2\nz = 3';
            const doc = new MockTextDocument(content);
            const currentLine = doc.lineAt(1);
            
            const result = getMultilineStatementRange(currentLine, doc);
            assert.strictEqual(result, undefined);
        });

        test('Cursor on opening line', () => {
            const content = 'x = (\n    1 + 2\n)';
            const doc = new MockTextDocument(content);
            const currentLine = doc.lineAt(0);
            
            const result = getMultilineStatementRange(currentLine, doc);
            assert.ok(result !== undefined);
            assert.strictEqual(result.startLine.lineNumber, 0);
            assert.strictEqual(result.endLine.lineNumber, 2);
        });

        test('Cursor on middle line', () => {
            const content = 'x = (\n    1 + 2\n)';
            const doc = new MockTextDocument(content);
            const currentLine = doc.lineAt(1);
            
            const result = getMultilineStatementRange(currentLine, doc);
            assert.ok(result !== undefined);
            assert.strictEqual(result.startLine.lineNumber, 0);
            assert.strictEqual(result.endLine.lineNumber, 2);
        });

        test('Cursor on closing line', () => {
            const content = 'x = (\n    1 + 2\n)';
            const doc = new MockTextDocument(content);
            const currentLine = doc.lineAt(2);
            
            const result = getMultilineStatementRange(currentLine, doc);
            assert.ok(result !== undefined);
            assert.strictEqual(result.startLine.lineNumber, 0);
            assert.strictEqual(result.endLine.lineNumber, 2);
        });

        test('Nested brackets', () => {
            const content = 'result = my_function(\n    [\n        1, 2,\n        3\n    ],\n    {"key": "value"}\n)';
            const doc = new MockTextDocument(content);
            const currentLine = doc.lineAt(2); // Inside the list
            
            const result = getMultilineStatementRange(currentLine, doc);
            assert.ok(result !== undefined);
            assert.strictEqual(result.startLine.lineNumber, 0);
            assert.strictEqual(result.endLine.lineNumber, 6);
        });

        test('Strings and comments with brackets', () => {
            const content = 'text = (\n    "This is a string with (parentheses)"\n    # This is a comment with [brackets]\n)';
            const doc = new MockTextDocument(content);
            const currentLine = doc.lineAt(1);
            
            const result = getMultilineStatementRange(currentLine, doc);
            assert.ok(result !== undefined);
            assert.strictEqual(result.startLine.lineNumber, 0);
            assert.strictEqual(result.endLine.lineNumber, 3);
        });

        test('Multiple independent statements', () => {
            const content = 'first_list = [\n    1,\n    2\n]\n\nsecond_list = [\n    3,\n    4\n]';
            const doc = new MockTextDocument(content);
            const currentLine = doc.lineAt(6); // Inside second_list
            
            const result = getMultilineStatementRange(currentLine, doc);
            assert.ok(result !== undefined);
            assert.strictEqual(result.startLine.lineNumber, 5);
            assert.strictEqual(result.endLine.lineNumber, 8);
        });
    });

    suite('isSelectionEmpty Tests', () => {
        test('isSelectionEmpty with standard Selection', () => {
            const emptySelection = new vscode.Selection(0, 0, 0, 0);
            const nonEmptySelection = new vscode.Selection(0, 0, 0, 5);
            
            assert.strictEqual(isSelectionEmpty(emptySelection), true);
            assert.strictEqual(isSelectionEmpty(nonEmptySelection), false);
        });

        test('isSelectionEmpty with multi-line selection', () => {
            const emptySelection = new vscode.Selection(0, 0, 0, 0);
            const multiLineSelection = new vscode.Selection(0, 0, 2, 5);
            
            assert.strictEqual(isSelectionEmpty(emptySelection), true);
            assert.strictEqual(isSelectionEmpty(multiLineSelection), false);
        });

        test('isSelectionEmpty with same line different character', () => {
            const emptySelection = new vscode.Selection(0, 0, 0, 0);
            const sameLineSelection = new vscode.Selection(0, 0, 0, 1);
            
            assert.strictEqual(isSelectionEmpty(emptySelection), true);
            assert.strictEqual(isSelectionEmpty(sameLineSelection), false);
        });
    });
});;