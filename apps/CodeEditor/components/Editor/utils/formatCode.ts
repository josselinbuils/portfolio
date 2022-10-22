import type { BuiltInParserName, Plugin } from 'prettier';
import type { EditableState } from '../../../interfaces/EditableState';
import { createSelection } from '../../../utils/createSelection';

interface Parser {
  name: string;
  parserFactory(): Promise<{ default: Plugin }>;
}

const parserDescriptors: { [language: string]: Parser } = {
  javascript: {
    name: 'babel',
    parserFactory: () => import('prettier/parser-babel'),
  },
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
      selection: createSelection(cursorOffset),
    };
  }

  const { name, parserFactory } = parserDescriptor;
  const prettier = (await import('prettier/standalone')).default;
  const parser = (await parserFactory()).default;

  const result = prettier.formatWithCursor(code, {
    cursorOffset,
    parser: name as BuiltInParserName,
    plugins: [parser],
    singleQuote: true,
  });

  return {
    code: result.formatted,
    selection: createSelection(result.cursorOffset),
  };
}
