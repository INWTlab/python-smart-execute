import * as assert from 'assert';
import * as bf from '../../../navigation/blockFinder';
import { MockTextDocument } from '../mocks';

suite('Block Finder Test Suite', () => {
    test('levelOfIndentation basic', () => {
        assert.strictEqual(bf.levelOfIndentation(''), 0);
        assert.strictEqual(bf.levelOfIndentation('    x = 1'), 4);
        assert.strictEqual(bf.levelOfIndentation('def test():'), 0);
        assert.strictEqual(bf.levelOfIndentation('    def nested():'), 4);
    });

    test('isBlockHeader basic', () => {
        const content = 'def test():\n    pass\n';
        const doc = new MockTextDocument(content);
        assert.strictEqual(bf.isBlockHeader(doc.lineAt(0), doc), true);
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

        const result = bf.findNextBlockHeader(doc, 5, 4);

        assert.strictEqual(result, undefined);
    });

    test('should maintain backward compatibility without targetIndentLevel', () => {
        const content = `def func1():
    pass

def func2():
    pass`;
        const doc = new MockTextDocument(content);

        const result = bf.findNextBlockHeader(doc, 0);

        assert.ok(result);
        assert.strictEqual(result!.lineNumber, 3);
    });
});
