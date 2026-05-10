import { type SupportedLanguage } from './interfaces/SupportedLanguage';

export const BRACKET_GROUPS = ['{}', '()', '[]'];

export const INDENT = '  ';

export const SUPPORTED_LANGUAGES: {
  label: string;
  language: SupportedLanguage;
}[] = [
  { label: 'CSS', language: 'css' },
  { label: 'HTML', language: 'html' },
  { label: 'JavaScript', language: 'javascript' },
  { label: 'JSON', language: 'json' },
  { label: 'JSX', language: 'jsx' },
  { label: 'Markdown', language: 'markdown' },
  { label: 'SCSS', language: 'scss' },
  { label: 'SVG', language: 'svg' },
  { label: 'TSX', language: 'tsx' },
  { label: 'TypeScript', language: 'typescript' },
  { label: 'XML', language: 'xml' },
  { label: 'YAML', language: 'yaml' },
];
