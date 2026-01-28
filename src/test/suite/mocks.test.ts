import * as assert from 'assert';
import { MockTextDocument, MockTextLine } from './mocks';

suite('Mocks Infrastructure Test Suite', () => {
	test('MockTextLine properties', () => {
		const text = "    print('hello')";
		const line = new MockTextLine(5, text);
		
		assert.strictEqual(line.lineNumber, 5);
		assert.strictEqual(line.text, text);
		assert.strictEqual(line.isEmptyOrWhitespace, false);
		assert.strictEqual(line.firstNonWhitespaceCharacterIndex, 4);
		assert.strictEqual(line.range.start.line, 5);
		assert.strictEqual(line.range.start.character, 0);
		assert.strictEqual(line.range.end.line, 5);
		assert.strictEqual(line.range.end.character, text.length);
	});

	test('MockTextLine whitespace handling', () => {
		const line = new MockTextLine(0, "   ");
		assert.strictEqual(line.isEmptyOrWhitespace, true);
	});

	test('MockTextDocument line access', () => {
		const content = [
			"def foo():",
			"    pass"
		];
		const doc = new MockTextDocument(content.join('\n'));
		
		assert.strictEqual(doc.lineCount, 2);
		assert.strictEqual(doc.lineAt(0).text, "def foo():");
		assert.strictEqual(doc.lineAt(1).text, "    pass");
	});

    test('MockTextDocument out of bounds', () => {
        const doc = new MockTextDocument("line1");
        assert.throws(() => doc.lineAt(5));
    });
});
