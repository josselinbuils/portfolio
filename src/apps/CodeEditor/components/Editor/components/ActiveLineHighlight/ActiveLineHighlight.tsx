import { type FC, useMemo } from 'preact/compat';
import { type Selection } from '@/apps/CodeEditor/interfaces/Selection';
import { getOffsetPosition } from '../../utils/getOffsetPosition';
import styles from './ActiveLineHighlight.module.scss';

export interface ActiveLineHighlightProps {
  code: string;
  parent: HTMLTextAreaElement;
  selection: Selection;
}

export const ActiveLineHighlight: FC<ActiveLineHighlightProps> = ({
  code,
  parent,
  selection,
}) => {
  const position = useMemo(
    () => getOffsetPosition(code, parent, selection[0]),
    [code, parent, selection],
  );
  return (
    <div className={styles.activeLineHighlight} style={{ top: position.y }} />
  );
};
