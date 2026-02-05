import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	// Suite-wide setup: ensure extension is activated
	suiteSetup(async () => {
		const extension = vscode.extensions.getExtension('inwtlab.python-smart-execute');
		if (extension) {
			await extension.activate();
		}
	});

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Navigation commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		console.log('Available commands:', commands.filter(c => c.includes('navigate')).slice(0, 10));
		assert.ok(commands.includes('python-smart-execute.navigateToNextBlock'));
		assert.ok(commands.includes('python-smart-execute.navigateToPreviousBlock'));
	});

    test('Navigate to next and previous block', async () => {
        // Create a new document
        const document = await vscode.workspace.openTextDocument({
            content: 'def first():\n    pass\n\ndef second():\n    pass',
            language: 'python'
        });
        const editor = await vscode.window.showTextDocument(document);

        // Start at the beginning
        editor.selection = new vscode.Selection(0, 0, 0, 0);

        // Trigger navigate to next block
        await vscode.commands.executeCommand('python-smart-execute.navigateToNextBlock');
        assert.strictEqual(editor.selection.active.line, 3, 'Should jump to second function');

        // Trigger navigate to previous block
        await vscode.commands.executeCommand('python-smart-execute.navigateToPreviousBlock');
        assert.strictEqual(editor.selection.active.line, 0, 'Should jump back to first function');
    });
});
