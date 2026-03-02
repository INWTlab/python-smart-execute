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

    test('findNextBlockHeader should respect targetIndentLevel parameter', () => {
        const content = `def outer():
    def inner1():
        pass
    
    def inner2():
        pass`;
        const doc = new MockTextDocument(content);
        
        const result = bf.findNextBlockHeader(doc, 1, 4);
        
        assert.ok(result, 'Should find a block header');
        assert.strictEqual(result!.lineNumber, 4, 'Should find inner2 at line 4');
        assert.strictEqual(bf.levelOfIndentation(result.text), 4, 'inner2 should be at indent 4');
    });

    test('findPreviousBlockHeader should respect targetIndentLevel parameter', () => {
        const content = `def outer():
    def inner1():
        pass
    
    def inner2():
        pass`;
        const doc = new MockTextDocument(content);
        
        const result = bf.findPreviousBlockHeader(doc, 4, 4);
        
        assert.ok(result, 'Should find a block header');
        assert.strictEqual(result!.lineNumber, 1, 'Should find inner1 at line 1');
        assert.strictEqual(bf.levelOfIndentation(result.text), 4, 'inner1 should be at indent 4');
    });
    
    test('should find correct block in complex nesting scenario', () => {
        const content = `class Outer:
    def outer_method(self):
        pass
    
    class Inner:
        def inner_method(self):
            pass`;
        const doc = new MockTextDocument(content);
        
        // From inner_method (line 5), find next block at same indent (4)
        const result = bf.findNextBlockHeader(doc, 5, 4);
        
        // Should find nothing (no more blocks at indent 4)
        assert.strictEqual(result, undefined);
    });
    
    test('should maintain backward compatibility without targetIndentLevel', () => {
        const content = `def func1():
    pass

def func2():
    pass`;
        const doc = new MockTextDocument(content);
        
        // Call without targetIndentLevel parameter
        const result = bf.findNextBlockHeader(doc, 0);
        
        // Should find func2 (line 3) - original behavior
        assert.ok(result);
        assert.strictEqual(result!.lineNumber, 3);
    });
});