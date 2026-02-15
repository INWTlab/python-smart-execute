import * as assert from 'assert';
import * as vscode from 'vscode';
import {
    isDecorator,
    findNextCodeLine,
    findMultiLineStatement,
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

    suite('findMultiLineStatement Tests', () => {
        test('findMultiLineStatement basic', () => {
            const content = 'data = {\n    "key1": "value1",\n    "key2": "value2"\n}\nprint("done")';
            const doc = new MockTextDocument(content);
            const currentLine = doc.lineAt(1); // Inside the dictionary
            const startLine = doc.lineAt(0); // Start of dictionary
            const endLine = doc.lineAt(3); // End of dictionary
            
            const result = findMultiLineStatement(currentLine, doc, startLine, endLine);
            
            assert.ok(result !== undefined);
            assert.strictEqual(result.lineNumber, 3);
        });

        test('findMultiLineStatement with nested brackets', () => {
            const content = 'result = {\n    "outer": {\n        "inner": [1, 2, 3]\n    }\n}\nprint("done")';
            const doc = new MockTextDocument(content);
            
            const currentLine = doc.lineAt(2); // Inside nested structure
            const startLine = doc.lineAt(0); // Start of dictionary
            const endLine = doc.lineAt(5); // End of dictionary
            
            const result = findMultiLineStatement(currentLine, doc, startLine, endLine);
            
            assert.ok(result !== undefined);
            assert.strictEqual(result.lineNumber, 2); // Current line has closing bracket, so it returns immediately
        });

        test('findMultiLineStatement returns undefined for single line', () => {
            const content = 'x = {"key": "value"}\nprint("done")';
            const doc = new MockTextDocument(content);
            const currentLine = doc.lineAt(0); // Single line dictionary
            const startLine = doc.lineAt(0);
            const endLine = doc.lineAt(1);
            
            const result = findMultiLineStatement(currentLine, doc, startLine, endLine);
            
            assert.strictEqual(result, undefined);
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