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
        return this._content;
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