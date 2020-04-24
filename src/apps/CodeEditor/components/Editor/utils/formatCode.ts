import parserBabel from 'prettier/parser-babel';
import prettier from 'prettier/standalone';

export function formatCode(
  code: string,
  cursorOffset: number
): { code: string; cursorOffset: number } {
  const result = prettier.formatWithCursor(code, {
    cursorOffset,
    parser: 'babel',
    plugins: [parserBabel],
    singleQuote: true,
  });

  return {
    code: result.formatted,
    cursorOffset: result.cursorOffset,
  };
}
