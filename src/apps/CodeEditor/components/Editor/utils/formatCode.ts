import parserBabel from 'prettier/parser-babel';
import prettier from 'prettier/standalone';

export function formatCode(
  code: string,
  cursorPosition: number
): { code: string; cursorPosition: number } {
  const { formatted, cursorOffset } = prettier.formatWithCursor(code, {
    cursorOffset: cursorPosition,
    parser: 'babel',
    plugins: [parserBabel],
    singleQuote: true,
  });

  return {
    code: formatted,
    cursorPosition: cursorOffset,
  };
}
