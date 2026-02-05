import * as assert from 'assert';
import * as vscode from 'vscode';
import * as bf from '../../navigation/blockFinder';
import { MockTextDocument } from './mocks';

suite('Block Finder Test Suite', () => {
    vscode.window.showInformationMessage('Start block finder tests.');

    test('Exports should exist', () => {
        assert.ok(bf.levelOfIndentation, 'levelOfIndentation is not exported');
        assert.ok(bf.isBlockHeader, 'isBlockHeader is not exported');
        assert.ok(bf.findBlockHeaderFromLine, 'findBlockHeaderFromLine is not exported');
        assert.ok(bf.getParentBlockHeader, 'getParentBlockHeader is not exported');
        assert.ok(bf.findNextBlockHeader, 'findNextBlockHeader is not exported');
        assert.ok(bf.findPreviousBlockHeader, 'findPreviousBlockHeader is not exported');
        assert.ok(bf.findFirstNestedBlockHeader, 'findFirstNestedBlockHeader is not exported');
    });

    test('levelOfIndentation basic', () => {
        assert.strictEqual(bf.levelOfIndentation(''), 0);
        assert.strictEqual(bf.levelOfIndentation('    x = 1'), 4);
        assert.strictEqual(bf.levelOfIndentation('def test():'), 0);
        assert.strictEqual(bf.levelOfIndentation('    def nested():'), 4);
    });

    test('isBlockHeader basic', () => {
        const content = 'def test():\n    pass\n';
        const doc = new MockTextDocument(content);
        const line = doc.lineAt(0);
        assert.strictEqual(bf.isBlockHeader(line, doc), true);
        assert.strictEqual(bf.isBlockHeader(doc.lineAt(1), doc), false);
    });
});