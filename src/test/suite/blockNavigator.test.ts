import * as assert from 'assert';
import * as vscode from 'vscode';
import { getTargetPosition, jumpNextBlock, jumpPreviousBlock } from '../../navigation/blockNavigator';
import { MockTextDocument } from './mocks';

suite('Block Navigator Test Suite', () => {
    test('Exports should exist', () => {
        // This is just a basic test to ensure our functions are properly exported
        assert.ok(typeof getTargetPosition === 'function', 'getTargetPosition should be a function');
        assert.ok(typeof jumpNextBlock === 'function', 'jumpNextBlock should be a function');
        assert.ok(typeof jumpPreviousBlock === 'function', 'jumpPreviousBlock should be a function');
    });
    
    test('Basic navigation functions', () => {
        // Create a mock document for testing
        const content = `def function1():
    pass

def function2():
    pass
    
class TestClass:
    def method1(self):
        pass
        
if condition:
    do_something()`;
        const doc = new MockTextDocument(content);
        const position = new vscode.Position(0, 0);
        
        // Test that our functions can be called without error
        const nextPos = jumpNextBlock(doc, position);
        const prevPos = jumpPreviousBlock(doc, position);
        
        // Basic existence checks
        assert.ok(nextPos instanceof vscode.Position, 'Should return a Position object');
        assert.ok(prevPos instanceof vscode.Position, 'Should return a Position object');
    });
    
    test('should have symmetric fallback at document end', () => {
        const content = `def function1():
    pass

def function2():
    pass`;
        const doc = new MockTextDocument(content);
        const position = new vscode.Position(3, 0);
        
        const result = jumpNextBlock(doc, position);
        
        // Should go to last line (line 5), not stay in place
        assert.strictEqual(result.line, doc.lineCount - 1);
    });
    
    test('should have symmetric fallback at document start', () => {
        const content = `def function1():
    pass

def function2():
    pass`;
        const doc = new MockTextDocument(content);
        const position = new vscode.Position(0, 0);
        
        const result = jumpPreviousBlock(doc, position);
        
        // Should go to line 0
        assert.strictEqual(result.line, 0);
    });
    
    test('should navigate to same-level next block using indentation', () => {
        const content = `def outer():
    def inner1():
        def deeply_nested():
            pass
    
    def inner2():
        pass

def another_function():
    pass`;
        const doc = new MockTextDocument(content);
        const position = new vscode.Position(1, 0); // On inner1 (indent 4)
        
        const result = jumpNextBlock(doc, position);
        
        // Should find inner2 (line 5, indent 4), not another_function (line 8, indent 0)
        // Without indentation awareness, it would skip inner2 and find deeply_nested first,
        // or skip to another_function
        assert.strictEqual(result.line, 5);
    });
    
    test('should navigate to same-level previous block using indentation', () => {
        const content = `def outer():
    def inner1():
        def deep():
            pass
    
    def inner2():
        pass`;
        const doc = new MockTextDocument(content);
        const position = new vscode.Position(5, 0); // On inner2 (indent 4)
        
        const result = jumpPreviousBlock(doc, position);
        
        // Should find inner1 (line 1, indent 4), not deep (line 2, indent 8)
        // Without indentation awareness, deep would be found first (it's closer, going backwards)
        assert.strictEqual(result.line, 1);
    });
    
    test('should handle decorated functions correctly', () => {
        const content = `@decorator
def decorated_func():
    pass

def normal_func():
    pass`;
        const doc = new MockTextDocument(content);
        const position = new vscode.Position(0, 0); // On decorator line
        
        const result = jumpNextBlock(doc, position);
        
        // Should find normal_func (line 4), not skip decorator logic
        assert.strictEqual(result.line, 4);
    });
    
    test('should handle multi-line statements correctly', () => {
        const content = `def func1():
    data = {
        'key': 'value'
    }
    pass

def func2():
    pass`;
        const doc = new MockTextDocument(content);
        const position = new vscode.Position(0, 0); // On func1
        
        const result = jumpNextBlock(doc, position);
        
        // Should find func2 (line 6), not get confused by multi-line dict
        assert.strictEqual(result.line, 6);
    });
});