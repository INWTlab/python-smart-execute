import * as path from 'path';

import { runTests, runVSCodeCommand } from '@vscode/test-electron';

async function installDependencies() {
	const extensions = [
		'ms-python.python',
		'ms-toolsai.jupyter'
	];

	for (const extId of extensions) {
		try {
			console.log(`Installing extension: ${extId}`);
			await runVSCodeCommand(['--install-extension', extId]);
			console.log(`✓ Successfully installed: ${extId}`);
		} catch (err) {
			console.error(`✗ Failed to install ${extId}:`, err);
			throw err;
		}
	}
}

async function main() {
	try {
		// Install required extension dependencies
		await installDependencies();

		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error('Failed to run tests', err);
		process.exit(1);
	}
}

main();
