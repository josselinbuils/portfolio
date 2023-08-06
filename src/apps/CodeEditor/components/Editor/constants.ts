import { BRACKET_GROUPS } from '../../constants';
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
