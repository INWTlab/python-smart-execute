/* eslint-disable @typescript-eslint/naming-convention */

export enum EndOfLine {
    LF = 1,
    CRLF = 2
}

export class Position {
    constructor(public line: number, public character: number) {}
}

export class Range {
    public start: Position;
    public end: Position;
    constructor(startLine: number, startChar: number, endLine: number, endChar: number);
    constructor(start: Position, end: Position);
    constructor(arg1: number | Position, arg2: number | Position, arg3?: number, arg4?: number) {
        if (typeof arg1 === 'number') {
            this.start = new Position(arg1, arg2 as number);
            this.end = new Position(arg3 as number, arg4 as number);
        } else {
            this.start = arg1;
            this.end = arg2 as Position;
        }
    }
}

export class Selection extends Range {
    public anchor: Position;
    public active: Position;
    constructor(anchorLine: number, anchorChar: number, activeLine: number, activeChar: number);
    constructor(anchor: Position, active: Position);
    constructor(arg1: number | Position, arg2: number | Position, arg3?: number, arg4?: number) {
        super(
            typeof arg1 === 'number' ? arg1 : arg1.line,
            typeof arg1 === 'number' ? (arg2 as number) : arg1.character,
            arg3 ?? 0,
            arg4 ?? 0
        );
        this.anchor = this.start;
        this.active = this.end;
    }
}

export const window = {
    showInformationMessage: () => Promise.resolve(''),
    activeTextEditor: undefined
};

export const workspace = {
    getConfiguration: () => ({
        get: (_key: string) => undefined,
        smartExecute: {
            blockSelect: true,
            engine: 'python',
            step: true,
            delay: 100
        }
    })
};

export const commands = {
    registerCommand: () => ({ dispose: () => {} }),
    executeCommand: () => Promise.resolve(undefined)
};

export enum SymbolKind {
    File = 0,
    Module = 1,
    Namespace = 2,
    Package = 3,
    Class = 4,
    Method = 5,
    Property = 6,
    Field = 7,
    Constructor = 8,
    Enum = 9,
    Interface = 10,
    Function = 11,
    Variable = 12,
    Constant = 13,
    String = 14,
    Number = 15,
    Boolean = 16,
    Array = 17,
    Object = 18,
    Key = 19,
    Null = 20,
    EnumMember = 21,
    Struct = 22,
    Event = 23,
    Operator = 24,
    TypeParameter = 25
}

export const Uri = {
    file: (path: string) => ({ fsPath: path, scheme: 'file' }),
    parse: (url: string) => ({ fsPath: url, scheme: 'file' })
};
