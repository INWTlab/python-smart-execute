import * as assert from 'assert';
import * as vscode from 'vscode';
import { findStartLineOfPythonCodeBlock, findEndLineOfPythonCodeBlock, isDecorator, findNextCodeLine } from '../../extension';
import { MockTextDocument, MockTextLine } from './mocks';

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
});