import { createAutoCLoseMap } from './utils';

export const BRACKET_GROUPS = ['{}', '()', '[]'];

export const AUTO_CLOSE_GROUPS = [...BRACKET_GROUPS, '""', "''", '``'];
export const AUTO_CLOSE_MAP = createAutoCLoseMap(AUTO_CLOSE_GROUPS);
export const AUTO_COMPLETION_KEYS = [
  'const ',
  'false',
  'function ',
  'let ',
  'return ',
  'true',
];
export const INDENT_SPACES = '  ';
