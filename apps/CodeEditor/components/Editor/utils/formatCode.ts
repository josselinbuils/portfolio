import { BuiltInParserName, Plugin } from 'prettier';
import 'prettier/parser-babel';
import prettier from 'prettier/standalone';
import { EditableState } from '../interfaces/EditableState';

const parserDescriptors = {
  css: {
    name: 'css',
    parserFactory: () => import('prettier/parser-postcss'),
  },
  javascript: {
    name: 'babel',
    parserFactory: () => import('prettier/parser-babel'),
  },
  json: {
    name: 'json',
    parserFactory: () => import('prettier/parser-babel'),
  },
  scss: {
    name: 'scss',
    parserFactory: () => import('prettier/parser-postcss'),
  },
} as {
  [language: string]: {
    name: string;
    parserFactory(): Promise<{ default: Plugin }>;
  };
};

export function canFormat(language: string): boolean {
  return parserDescriptors[language] !== undefined;
}

export async function formatCode(
  code: string,
  cursorOffset: number,
  language: string
): Promise<EditableState> {
  const parserDescriptor = parserDescriptors[language];

  if (parserDescriptor === undefined) {
    return {
      code,
      selection: { start: cursorOffset, end: cursorOffset },
    };
  }

  const { name, parserFactory } = parserDescriptor;
  const parser = (await parserFactory()).default;

  const result = prettier.formatWithCursor(code, {
    cursorOffset,
    parser: name as BuiltInParserName,
    plugins: [parser],
    singleQuote: true,
  });

  return {
    code: result.formatted,
    selection: {
      start: result.cursorOffset,
      end: result.cursorOffset,
    },
  };
}
