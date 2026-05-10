import { type JSX } from 'preact';

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

export interface LanguageService {
  getCompletions(
    code: string,
    cursorOffset: number,
  ): Awaitable<Completions | undefined>;
  getQuickInfo(
    code: string,
    cursorOffset: number,
  ): Awaitable<JSX.Element | string | undefined>;
  lint(code: string): Awaitable<LintIssue[]>;
  transpile(code: string): Awaitable<string>;
}

export interface LintIssue {
  length: number;
  level: LintIssueLevel;
  message: string;
  start: number;
}

export type LintIssueLevel = 'error' | 'warning';
