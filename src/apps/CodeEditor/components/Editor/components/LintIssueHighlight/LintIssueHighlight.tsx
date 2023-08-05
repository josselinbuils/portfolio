import cn from 'classnames';
import { type FC, useMemo } from 'preact/compat';
import { type LintIssue } from '@/apps/CodeEditor/interfaces/LanguageService';
import { getOffsetPosition } from '../../utils/getOffsetPosition';
import styles from './LintIssueHighlight.module.scss';

export interface LintIssueHighlightProps {
  code: string;
  issue: LintIssue;
  parent: HTMLTextAreaElement;
}

export const LintIssueHighlight: FC<LintIssueHighlightProps> = ({
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
