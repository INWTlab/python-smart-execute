import * as vscode from 'vscode';
import * as assert from 'assert';
import { MockTextDocument, MockTextEditor } from '../mocks';
import { smartSelect } from '../../../smartExecute/selection';
import { getConfigSmartExecute } from '../../../smartExecute/config';

export class DocumentState {
    constructor(
        readonly content: string,
        readonly cursorLine: number,
        readonly cursorChar: number
    ) {}
    
    createEditor(): MockTextEditor {
        const doc = new MockTextDocument(this.content);
        const editor = new MockTextEditor(doc);
        editor.selection = new vscode.Selection(
            this.cursorLine,
            this.cursorChar,
            this.cursorLine,
            this.cursorChar
        );
        return editor;
    }
}

export interface ExpectSelectionOptions {
    smartExecute?: boolean;
}

export function expectSelection(
    state: DocumentState,
    startLine: number,
    endLine: number,
    options?: ExpectSelectionOptions
): void {
    const smartExecute = options?.smartExecute ?? true;
    const editor = state.createEditor();
    
    const originalGetConfig = getConfigSmartExecute;
    (getConfigSmartExecute as unknown as () => boolean) = () => smartExecute;
    
    try {
        const selectedText = smartSelect(editor);
        
        const lines = state.content.split('\n');
        const selectedLines = lines.slice(startLine, endLine + 1);
        const expectedSelection = selectedLines.join('\n');
        
        assert.strictEqual(editor.selection.start.line, startLine);
        assert.strictEqual(editor.selection.end.line, endLine);
        assert.strictEqual(selectedText, expectedSelection);
    } finally {
        (getConfigSmartExecute as unknown as () => boolean) = originalGetConfig;
    }
}
