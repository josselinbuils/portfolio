import { BRACKET_GROUPS } from '../../constants';
import { type SupportedLanguage } from './interfaces/SupportedLanguage';
import { createAutoCLoseMap } from './utils/createAutoCloseMap';

export const AUTO_CLOSE_GROUPS = [...BRACKET_GROUPS, '""', "''", '``'];
export const AUTO_CLOSE_MAP = createAutoCLoseMap(AUTO_CLOSE_GROUPS);

export const START_CODE_PORTION_CHARS = [' ', '\n', '(', '[', '{', undefined];
export const END_CODE_PORTION_CHARS = [
  ' ',
  '\n',
  ')',
  ']',
  '}',
  '.',
  undefined,
];

export const INDENT = '  ';

export const SUPPORTED_LANGUAGES: {
  language: SupportedLanguage;
  label: string;
}[] = [
  { language: 'css', label: 'CSS' },
  { language: 'html', label: 'HTML' },
  { language: 'javascript', label: 'JavaScript' },
  { language: 'json', label: 'JSON' },
  { language: 'jsx', label: 'JSX' },
  { language: 'markdown', label: 'Markdown' },
  { language: 'scss', label: 'SCSS' },
  { language: 'svg', label: 'SVG' },
  { language: 'tsx', label: 'TSX' },
  { language: 'typescript', label: 'TypeScript' },
  { language: 'xml', label: 'XML' },
  { language: 'yaml', label: 'YAML' },
];
