import { type BuiltInParserName, type Plugin } from 'prettier';
import { type PartialRecord } from '@/platform/interfaces/PartialRecord';
import { type EditableState } from '../../../interfaces/EditableState';
import { type SupportedLanguage } from '../../../interfaces/SupportedLanguage';
import { createSelection } from '../../../utils/createSelection';

interface Parser {
  name: string;
  parserFactory(): Promise<{ default: Plugin }>[];
}

const babelParserFactory = () => [
  import('prettier/plugins/babel'),
  import('prettier/plugins/estree' as any),
];

const htmlParserFactory = () => [import('prettier/plugins/html')];

const postCssParserFactory = () => [import('prettier/plugins/postcss')];

const parserDescriptors: PartialRecord<SupportedLanguage, Parser> = {
  css: {
    name: 'css',
    parserFactory: postCssParserFactory,
  },
  html: {
    name: 'html',
    parserFactory: htmlParserFactory,
  },
  javascript: {
    name: 'babel',
    parserFactory: babelParserFactory,
  },
  json: {
    name: 'json',
    parserFactory: babelParserFactory,
  },
  jsx: {
    name: 'babel',
    parserFactory: babelParserFactory,
  },
  markdown: {
    name: 'markdown',
    parserFactory: () => [import('prettier/plugins/markdown')],
  },
  scss: {
    name: 'scss',
    parserFactory: postCssParserFactory,
  },
  svg: {
    name: 'html',
    parserFactory: htmlParserFactory,
  },
  tsx: {
    name: 'babel-ts',
    parserFactory: babelParserFactory,
  },
  typescript: {
    name: 'babel-ts',
    parserFactory: babelParserFactory,
  },
  xml: {
    name: 'html',
    parserFactory: htmlParserFactory,
  },
  yaml: {
    name: 'yaml',
    parserFactory: () => [import('prettier/plugins/yaml')],
  },
};

export async function formatCode(
  code: string,
  cursorOffset: number,
  language: string,
): Promise<EditableState> {
  const parserDescriptor = parserDescriptors[language as SupportedLanguage];

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
