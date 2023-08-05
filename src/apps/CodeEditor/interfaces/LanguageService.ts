import { type JSX } from 'preact/compat';

export type LintIssueLevel = 'error' | 'warning';

export interface LintIssue {
  length: number;
  start: number;
  message: string;
  level: LintIssueLevel;
}

export interface LanguageService {
  getQuickInfo(
    code: string,
    cursorOffset: number,
  ):
    | string
    | JSX.Element
    | undefined
    | Promise<string | JSX.Element | undefined>;
  lint(code: string): LintIssue[] | Promise<LintIssue[]>;
  transpile(code: string): string | Promise<string>;
}
