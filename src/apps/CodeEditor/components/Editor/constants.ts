import { createAutoCLoseMap } from './utils';

export const BRACKET_GROUPS = ['{}', '()', '[]'];

export const AUTO_CLOSE_GROUPS = [...BRACKET_GROUPS, '""', "''", '``'];
export const AUTO_CLOSE_MAP = createAutoCLoseMap(AUTO_CLOSE_GROUPS);
export const END_WORD_CHARS = [' ', '\n', ')', ']', '}', undefined];
export const INDENT_SPACES = '  ';
