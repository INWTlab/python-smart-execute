import * as vscode from 'vscode';

/**
 * Check if a line opens a multi-line statement (contains unclosed brackets, braces or parens)
 * @param lineText The text of the line to check
 * @returns boolean indicating if the line opens a multi-line statement
 */
export function isOpenParenthesisLine(lineText: string): boolean {
  // Remove comments and strings to avoid false positives
  // First remove comments to get only the code part
  const lineWithoutComments = lineText.replace(/#.*/g, '');
  // Then remove strings (only in the code part)
  const lineWithoutStringsOrComments = lineWithoutComments
    .replace(/"(?:\\.|[^"\\])*"/g, '') // Remove double-quoted strings
    .replace(/'(?:\\.|[^'\\])*'/g, ''); // Remove single-quoted strings

  // Count opening and closing brackets
  const openBrackets = (lineWithoutStringsOrComments.match(/[({[]/g) || []).length;
  const closeBrackets = (lineWithoutStringsOrComments.match(/[)}\]]/g) || []).length;

  // If we have more opening brackets than closing brackets, it's an open line
  return openBrackets > closeBrackets;
}

/**
 * Check if a line is the end of a multi-line statement
 * @param lineText The text of the line to check
 * @returns boolean indicating if the line is the end of a multi-line statement
 */
export function isMultiLineStatementEnd(lineText: string): boolean {
  // A line is the end of a multi-line statement if:
  // 1. It's not an open parenthesis line
  // 2. It's not empty or just whitespace
  const trimmedLine = lineText.trim();
  return !isOpenParenthesisLine(lineText) && trimmedLine.length > 0 && 
         !isOpenParenthesisLine(trimmedLine);
}

/**
 * Skip over lines that are part of a multi-line statement
 * @param document The text document
 * @param line The starting line number
 * @returns The line number after skipping multi-line statements
 */
export function skipMultiLineStatement(document: vscode.TextDocument, line: number): number {
  let currentLine = line;
  let balance = 0;

  // Continue until we've found the end of the multi-line statement (brackets balanced)
  while (currentLine < document.lineCount) {
    const lineText = document.lineAt(currentLine).text;
    const lineWithoutStringsOrComments = lineText
      .replace(/"(?:\\.|[^"\\])*"/g, '')
      .replace(/'(?:\\.|[^'\\])*'/g, '')
      .replace(/#.*/g, '');

    // Count brackets for this line
    balance += (lineWithoutStringsOrComments.match(/[({[]/g) || []).length;
    balance -= (lineWithoutStringsOrComments.match(/[)}\]]/g) || []).length;

    // If brackets are balanced and we have content, this is the end
    if (balance === 0 && lineText.trim().length > 0 && currentLine > line) {
      break;
    }

    currentLine++;
  }

  return currentLine;
}