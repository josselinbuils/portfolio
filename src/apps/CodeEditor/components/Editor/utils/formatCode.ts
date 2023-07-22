import { type BuiltInParserName, type Plugin } from 'prettier';
import { type EditableState } from '../../../interfaces/EditableState';
import { createSelection } from '../../../utils/createSelection';

interface Parser {
  name: string;
  parserFactory(): Promise<{ default: Plugin }>[];
}

const parserDescriptors: { [language: string]: Parser } = {
  css: {
    name: 'css',
    parserFactory: () => [import('prettier/plugins/postcss')],
  },
  html: {
    name: 'html',
    parserFactory: () => [import('prettier/plugins/html')],
  },
  javascript: {
    name: 'babel',
    parserFactory: () => [
      import('prettier/plugins/babel'),
      import('prettier/plugins/estree' as any),
    ],
  },
  json: {
    name: 'json',
    parserFactory: () => [
      import('prettier/plugins/babel'),
      import('prettier/plugins/estree' as any),
    ],
  },
  markdown: {
    name: 'markdown',
    parserFactory: () => [import('prettier/plugins/markdown')],
  },
  scss: {
    name: 'scss',
    parserFactory: () => [import('prettier/plugins/postcss')],
  },
  typescript: {
    name: 'babel-ts',
    parserFactory: () => [
      import('prettier/plugins/babel'),
      import('prettier/plugins/estree' as any),
    ],
  },
  yaml: {
    name: 'yaml',
    parserFactory: () => [import('prettier/plugins/yaml')],
  },
};

export function canFormat(language: string): boolean {
  return parserDescriptors[language] !== undefined;
}

export async function formatCode(
  code: string,
  cursorOffset: number,
  language: string,
): Promise<EditableState> {
  const parserDescriptor = parserDescriptors[language];

  if (parserDescriptor === undefined) {
    return {
      code,
      selection: createSelection(cursorOffset),
    };
  }

  const { name, parserFactory } = parserDescriptor;
  const { formatWithCursor } = await import('prettier/standalone');
  const plugins = await Promise.all(
    parserFactory().map(async (modulePromise) => (await modulePromise).default),
  );

  const result = await formatWithCursor(code, {
    cursorOffset,
    parser: name as BuiltInParserName,
    plugins,
    singleQuote: true,
  });

  return {
    code: result.formatted,
    selection: createSelection(result.cursorOffset),
  };
}
