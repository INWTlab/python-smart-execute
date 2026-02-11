import * as vscode from 'vscode';

export function isNotLastLine(currentLine: number, lineCount: number) {
    return currentLine < lineCount - 1;
}

export function lineIsCode(line: vscode.TextLine | undefined) {
    const lineText = line?.text || '';
    return !(line?.isEmptyOrWhitespace || /^\s*#/.test(lineText));
}

export function isDecorator(text: string) {
    return /^\s*@/.test(text);
}

export function isClosingParanthesis(text: string) {
    return /^\s*[)\]}]+/.test(text);
}

export function isExcept(text: string) {
    return /^\s*except[\s:]/.test(text);
}

export function isFinally(text: string) {
    return /^\s*finally:/.test(text);
}

export function isElif(text: string) {
    return /^\s*elif\s/.test(text);
}

export function isElse(text: string) {
    return /^\s*else:/.test(text);
}

export function levelOfIndentation(line: string) {
    const regexpMatch = line.match(/^\s*/);
    if (regexpMatch === null) {
        return 0;
    } else {
        return regexpMatch[0].length;
    }
}

export function indentationAsString(line: string) {
    const regexpMatch = line.match(/^\s*/);
    if (regexpMatch === null) {
        return '';
    } else {
        return regexpMatch[0];
    }
}
