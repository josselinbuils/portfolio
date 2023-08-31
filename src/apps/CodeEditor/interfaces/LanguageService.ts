import { type JSX } from 'preact/compat';
import { type Awaitable } from '@/platform/interfaces/Awaitable';

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
  ): Awaitable<Completions | undefined>;
  getQuickInfo(
    code: string,
    cursorOffset: number,
  ): Awaitable<string | JSX.Element | undefined>;
  lint(code: string): Awaitable<LintIssue[]>;
  transpile(code: string): Awaitable<string>;
}
