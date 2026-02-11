import * as vscode from 'vscode';

export function getConfigEngine(): string {
    return vscode.workspace.getConfiguration('inwtlab.Python.Smart.Execute').smartExecute.engine;
}

export function getConfigSmartExecute(): boolean {
    return vscode.workspace.getConfiguration('inwtlab.Python.Smart.Execute').smartExecute.blockSelect;
}

export function getConfigStep(): boolean {
    return vscode.workspace.getConfiguration('inwtlab.Python.Smart.Execute').smartExecute.step;
}

export function getConfigDelay(): number {
    return vscode.workspace.getConfiguration('inwtlab.Python.Smart.Execute').smartExecute.delay;
}
