import * as vscode from 'vscode';

export class MockTextLine implements vscode.TextLine {
    private _lineNumber: number;
    private _text: string;

    constructor(lineNumber: number, text: string) {
        this._lineNumber = lineNumber;
        this._text = text;
    }

    get lineNumber(): number {
        return this._lineNumber;
    }

    get text(): string {
        return this._text;
    }

    get range(): vscode.Range {
        return new vscode.Range(this._lineNumber, 0, this._lineNumber, this._text.length);
    }

    get rangeIncludingLineBreak(): vscode.Range {
        return this.range; // Simplified
    }

    get firstNonWhitespaceCharacterIndex(): number {
        const index = this._text.search(/\S/);
        return index === -1 ? this._text.length : index;
    }

    get isEmptyOrWhitespace(): boolean {
        return this._text.trim().length === 0;
    }
}

export class MockTextDocument implements vscode.TextDocument {
    private lines: MockTextLine[];
    private _content: string;
    
    constructor(content: string) {
        this._content = content;
        this.lines = content.split('\n').map((text, index) => new MockTextLine(index, text));
    }

    get uri(): vscode.Uri {
        return vscode.Uri.file('mock://test.py');
    }

    get fileName(): string {
        return 'test.py';
    }

    get isUntitled(): boolean {
        return true;
    }

    get languageId(): string {
        return 'python';
    }

    get version(): number {
        return 1;
    }

    get isDirty(): boolean {
        return false;
    }

    get isClosed(): boolean {
        return false;
    }

    get saveId(): string | undefined {
        return undefined;
    }

    lineAt(line: number | vscode.Position): vscode.TextLine {
        const index = typeof line === 'number' ? line : line.line;
        if (index < 0 || index >= this.lines.length) {
             throw new Error('Illegal argument ' + index);
        }
        return this.lines[index];
    }

    offsetAt(_position: vscode.Position): number {
        return 0;
    }

    positionAt(_offset: number): vscode.Position {
        return new vscode.Position(0, 0);
    }

    getText(range?: vscode.Range): string {
        if (!range) {
            return this._content;
        }
        const lines = this._content.split('\n');
        const startLine = range.start.line;
        const endLine = range.end.line;
        const startChar = range.start.character;
        const endChar = range.end.character;
        
        if (startLine === endLine) {
            return lines[startLine].substring(startChar, endChar);
        }
        
        let result = lines[startLine].substring(startChar) + '\n';
        for (let i = startLine + 1; i < endLine; i++) {
            result += lines[i] + '\n';
        }
        result += lines[endLine].substring(0, endChar);
        return result;
    }

    getWordRangeAtPosition(_position: vscode.Position | vscode.Position, _regex?: RegExp): vscode.Range | undefined {
        return undefined;
    }

    validateRange(range: vscode.Range): vscode.Range {
        return range;
    }

    validatePosition(position: vscode.Position): vscode.Position {
        return position;
    }

    get lineCount(): number {
        return this.lines.length;
    }

    get eol(): vscode.EndOfLine {
        return vscode.EndOfLine.LF;
    }

    get encoding(): string {
        return 'utf8';
    }

    save(): Thenable<boolean> {
        return Promise.resolve(true);
    }
}

export class MockTextEditor implements vscode.TextEditor {
    document: vscode.TextDocument;
    selection: vscode.Selection;
    
    constructor(document: vscode.TextDocument) {
        this.document = document;
        this.selection = new vscode.Selection(0, 0, 0, 0);
    }
    
    setSelection(selection: vscode.Selection): void {
        this.selection = selection;
    }
    
    // Stub implementations for required methods
    edit(_callback: (editBuilder: vscode.TextEditorEdit) => void): Thenable<boolean> {
        return Promise.resolve(true);
    }
    
    insertSnippet(_snippet: vscode.SnippetString, _location?: vscode.Position | vscode.Range | vscode.Position[] | vscode.Range[], _options?: { undoStopBefore: boolean; undoStopAfter: boolean }): Thenable<boolean> {
        return Promise.resolve(true);
    }
    
    setDecorations(_decorationType: vscode.TextEditorDecorationType, _rangesOrOptions: vscode.Range[] | vscode.DecorationOptions[]): void {
        // No-op
    }
    
    revealRange(_range: vscode.Range, _revealType?: vscode.TextEditorRevealType): void {
        // No-op
    }
    
    show(_column?: vscode.ViewColumn): void {
        // No-op
    }
    
    hide(): void {
        // No-op
    }
    
    get visibleRanges(): vscode.Range[] {
        return [new vscode.Range(0, 0, this.document.lineCount - 1, 0)];
    }
    
    get selections(): vscode.Selection[] {
        return [this.selection];
    }
    
    setSelections(selections: vscode.Selection[]): void {
        if (selections.length > 0) {
            this.selection = selections[0];
        }
    }
    
    get options(): vscode.TextEditorOptions {
        return {
            tabSize: 4,
            insertSpaces: true,
            // Add other default options as needed
        } as vscode.TextEditorOptions;
    }
    
    setOptions(_options: vscode.TextEditorOptions): Thenable<void> {
        return Promise.resolve();
    }
    
    get viewColumn(): vscode.ViewColumn | undefined {
        return vscode.ViewColumn.One;
    }
}