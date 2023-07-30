import cn from 'classnames';
import { type FC, useMemo } from 'preact/compat';
import { getOffsetPosition } from '../../utils/getOffsetPosition';
import styles from './LintIssue.module.scss';

export type LintIssueLevel = 'error' | 'warning';

export interface LintIssue {
  length: number;
  start: number;
  message: string;
  level: LintIssueLevel;
}

export interface LintIssueProps {
  code: string;
  issue: LintIssue;
  parent: HTMLTextAreaElement;
}

export const LintIssue: FC<LintIssueProps> = ({ code, issue, parent }) => {
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
