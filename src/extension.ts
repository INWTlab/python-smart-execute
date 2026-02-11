// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { jumpNextBlock, jumpPreviousBlock } from "./navigation/blockNavigator";
import { getConfigDelay, getConfigEngine, getConfigStep } from "./smartExecute/config";
import { smartSelect, stepCursor } from "./smartExecute/selection";
import { selectionToRepl } from "./smartExecute/execution";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("python-smart-execute.smartExecAndStep", async () => {
            const engine = getConfigEngine();
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = smartSelect(editor);
                await delay();
                if (engine === "python") {
                    selectionToRepl(selection);
                } else if (engine === "jupyter") {
                    vscode.commands.executeCommand("jupyter.execSelectionInteractive", selection);
                }
                if (getConfigStep()) {
                    stepCursor(editor);
                }
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("python-smart-execute.debugExecAndStep", async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                smartSelect(editor);
                await delay();
                vscode.commands.executeCommand("editor.debug.action.selectionToRepl");
                if (getConfigStep()) {
                    stepCursor(editor);
                }
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("python-smart-execute.navigateToNextBlock", () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const position = editor.selection.active;
                const newPosition = jumpNextBlock(editor.document, position);
                editor.selection = new vscode.Selection(newPosition, newPosition);
                editor.revealRange(new vscode.Range(newPosition, newPosition));
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("python-smart-execute.navigateToPreviousBlock", () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const position = editor.selection.active;
                const newPosition = jumpPreviousBlock(editor.document, position);
                editor.selection = new vscode.Selection(newPosition, newPosition);
                editor.revealRange(new vscode.Range(newPosition, newPosition));
            }
        }),
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}

function delay() {
    const ms: number = getConfigDelay();
    return new Promise((resolve) => setTimeout(resolve, ms));
}
