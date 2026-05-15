import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';

import { type LintIssue } from '@/apps/CodeEditor/interfaces/LanguageService';

import { getOffsetPosition } from '../../utils/getOffsetPosition';
import styles from './LintIssueHighlight.module.scss';

export type LintIssueHighlightProps = {
  code: string;
  issue: LintIssue;
  parent: HTMLTextAreaElement;
};

export const LintIssueHighlight: FunctionComponent<LintIssueHighlightProps> = ({
  code,
  issue,
  parent,
}) => {
  const { length, level, start } = issue;
  const position = useMemo(
    () => getOffsetPosition(code, parent, start),
    [code, parent, start],
  );
  return (
    <div
      className={cn(styles.lintIssue, styles[level])}
      style={{ left: position.x, top: position.y, width: `${length}ch` }}
    />
  );
};
