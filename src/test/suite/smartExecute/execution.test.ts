import * as assert from 'assert';
import { sanitizeSelection } from '../../../smartExecute/execution';

suite('Smart Execute Execution Tests', () => {
    test('removes shared indentation and appends trailing newline', () => {
        const code = '    def foo():\n        return 1';
        const sanitized = sanitizeSelection(code);
        assert.strictEqual(sanitized, 'def foo():\n    return 1\n\n');
    });

    test('fills blank lines with next line indentation', () => {
        const code = '    if True():\n        print(1)\n        \n        print(2)\n';
        const sanitized = sanitizeSelection(code);
        const lines = sanitized.split('\n');
        assert.strictEqual(lines[2], '    ');
        assert.strictEqual(lines[3], '    print(2)');
    });
});
