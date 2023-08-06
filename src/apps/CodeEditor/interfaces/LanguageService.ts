import { type JSX } from 'preact/compat';

export interface CompletionItem {
  cursorOffsetInValue?: number; // value.length by default
  name: string;
  value: string;
}

export interface Completions {
  items: CompletionItem[];
  startOffset: number;
}

export type LintIssueLevel = 'error' | 'warning';

export interface LintIssue {
  length: number;
  start: number;
  message: string;
  level: LintIssueLevel;
}

export interface LanguageService {
  getCompletions(
    code: string,
    cursorOffset: number,
  ): Completions | undefined | Promise<Completions | undefined>;
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
