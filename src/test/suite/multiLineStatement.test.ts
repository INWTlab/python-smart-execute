import * as assert from 'assert';
import * as vscode from 'vscode';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as mls from '../../navigation/multiLineStatement';
import { MockTextDocument } from './mocks';

suite('Multi-line Statement Test Suite', () => {
    vscode.window.showInformationMessage('Start multi-line statement tests.');

    test('Exports should exist', () => {
        assert.ok(mls.isOpenParenthesisLine, 'isOpenParenthesisLine is not exported');
        assert.ok(mls.isMultiLineStatementEnd, 'isMultiLineStatementEnd is not exported');
        assert.ok(mls.skipMultiLineStatement, 'skipMultiLineStatement is not exported');
    });

    test('isOpenParenthesisLine basic', () => {
        assert.strictEqual(mls.isOpenParenthesisLine('x = {'), true);
        assert.strictEqual(mls.isOpenParenthesisLine('x = {}'), false);
        assert.strictEqual(mls.isOpenParenthesisLine('def x(y = [1, 2, 3]):'), false);
    });

    test('isOpenParenthesisLine with strings and comments', () => {
        // Brackets inside strings or comments should not affect the result
        assert.strictEqual(mls.isOpenParenthesisLine('x = "text with {"'), false);  // { is inside string
        assert.strictEqual(mls.isOpenParenthesisLine('x = [1, 2, 3]  # comment with {'), false);  // {} both balanced
        assert.strictEqual(mls.isOpenParenthesisLine('x = { # comment with }'), true);  // { is outside comment and not closed
        assert.strictEqual(mls.isOpenParenthesisLine('# { comment only'), false);  // no code before comment
    });

    test('isMultiLineStatementEnd basic', () => {
        assert.strictEqual(mls.isMultiLineStatementEnd('x = 1'), true);
        assert.strictEqual(mls.isMultiLineStatementEnd('x = {'), false);
    });

    test('skipMultiLineStatement basic', () => {
        const content = 'x = {\n    "key": "value"\n}\n';
        const doc = new MockTextDocument(content);
        assert.strictEqual(mls.skipMultiLineStatement(doc, 0), 2);
    });
});