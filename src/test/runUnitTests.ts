import * as path from 'path';
import * as Mocha from 'mocha';
import { glob } from 'glob';

// Mock the vscode module before anything else
// Using a relative path that works both in src/ and out/
const vscodeMock = require('./suite/vscode.mock');
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(name: string) {
	if (name === 'vscode') {
		return vscodeMock;
	}
	return originalRequire.apply(this, arguments);
};

async function main() {
	try {
		// Create the mocha test
		const mocha = new Mocha({
			ui: 'tdd',
			color: true
		});

		const testsRoot = path.resolve(__dirname, './suite');

		// Only include unit test files (exclude extension.test.ts which requires VS Code)
		const files = await glob('**/**.test.js', { 
			cwd: testsRoot,
			ignore: ['**/extension.test.js'] // Exclude integration tests
		});

		// Add files to the test suite
		files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

		console.log('Running unit tests without VS Code integration...');
		console.log('Test files:', files);

		return new Promise<void>((c, e) => {
			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				console.error(err);
				e(err);
			}
		});
	} catch (err) {
		console.error('Failed to run unit tests', err);
		process.exit(1);
	}
}

main();