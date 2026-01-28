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

export class MockTextDocument {
    private lines: MockTextLine[];
    
    constructor(content: string) {
        this.lines = content.split('\n').map((text, index) => new MockTextLine(index, text));
    }

    lineAt(line: number | vscode.Position): vscode.TextLine {
        const index = typeof line === 'number' ? line : line.line;
        if (index < 0 || index >= this.lines.length) {
             throw new Error('Illegal argument ' + index);
        }
        return this.lines[index];
    }

    get lineCount(): number {
        return this.lines.length;
    }
    
    // Minimal implementation of getText to satisfy basic usage if needed
    getText(range?: vscode.Range): string {
        if (!range) {
            return this.lines.map(l => l.text).join('\n');
        }
        // This is a simplified Mock, complex range extraction not implemented yet
        return "";
    }
}