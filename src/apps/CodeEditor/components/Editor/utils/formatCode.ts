import { BuiltInParserName, Plugin } from 'prettier';

const parserDescriptors = {
  css: {
    name: 'css',
    parserFactory: () => import('prettier/parser-postcss'),
  },
  html: {
    name: 'html',
    parserFactory: () => import('prettier/parser-html'),
  },
  javascript: {
    name: 'babel',
    parserFactory: () => import('prettier/parser-babel'),
  },
  json: {
    name: 'json',
    parserFactory: () => import('prettier/parser-babel'),
  },
  markdown: {
    name: 'markdown',
    parserFactory: () => import('prettier/parser-markdown'),
  },
  scss: {
    name: 'scss',
    parserFactory: () => import('prettier/parser-postcss'),
  },
  yaml: {
    name: 'yaml',
    parserFactory: () => import('prettier/parser-yaml'),
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
): Promise<{ code: string; cursorOffset: number }> {
  const prettier = (await import('prettier/standalone')).default;
  const parserDescriptor = parserDescriptors[language];

  if (parserDescriptor === undefined) {
    return { code, cursorOffset };
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
    cursorOffset: result.cursorOffset,
  };
}
