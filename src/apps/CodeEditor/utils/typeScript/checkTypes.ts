/** @see https://jakerunzer.com/running-ts-in-browser */
import { DiagnosticCategory, type DiagnosticMessageChain } from 'typescript';
import { type PartialRecord } from '@/platform/interfaces/PartialRecord';
import {
  type LintIssue,
  type LintIssueLevel,
} from '../../components/Editor/components/LintIssue/LintIssue';
import { createLanguageService } from './createLanguageService';

const categoryToLintLevelMap: PartialRecord<
  DiagnosticCategory,
  LintIssueLevel
> = {
  [DiagnosticCategory.Error]: 'error',
  [DiagnosticCategory.Warning]: 'warning',
};

const excludedTsCodes = [2307];

export function checkTypes(code: string): LintIssue[] {
  try {
    const languageService = createLanguageService(code);
    const diagnostics = languageService.getSemanticDiagnostics();

    return diagnostics
      .map(
        ({
          category,
          code: tsCode,
          length,
          messageText,
          start,
        }): LintIssue | undefined => {
          const level = categoryToLintLevelMap[category];

          return length !== undefined &&
            level !== undefined &&
            start !== undefined &&
            !excludedTsCodes.includes(tsCode)
            ? {
                length,
                level,
                message: `TS${tsCode}: ${
                  typeof messageText === 'string'
                    ? messageText
                    : getMessageFromDiagnosticMessageChain(messageText)
                }`,
                start,
              }
            : undefined;
        },
      )
      .filter((lintIssue): lintIssue is LintIssue => Boolean(lintIssue));
  } catch (error) {
    console.error('An error occurred during type check:', error);
    return [];
  }
}

function getMessageFromDiagnosticMessageChain({
  messageText,
  next,
}: DiagnosticMessageChain): string {
  return (
    next?.reduce(
      (message, diagnosticMessageChain) =>
        `${message}\n${getMessageFromDiagnosticMessageChain(
          diagnosticMessageChain,
        )}`,
      messageText,
    ) ?? messageText
  );
}
