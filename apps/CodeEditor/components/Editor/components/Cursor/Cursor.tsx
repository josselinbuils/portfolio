import { FC, useMemo } from 'react';
import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { getOffsetPosition } from '../../utils/getOffsetPosition';
import { computeSegments } from './utils/computeSegments';

import styles from './Cursor.module.scss';

interface Props {
  code: string;
  color: string;
  parent: HTMLTextAreaElement;
  selection: Selection;
}

export const Cursor: FC<Props> = ({ code, color, parent, selection }) => {
  const position = useMemo(
    () => getOffsetPosition(parent, selection[0]),
    [selection, parent]
  );
  const segments = useMemo(
    () => computeSegments(code, selection, parent),
    [code, parent, selection]
  );

  return segments.length > 0 ? (
    <>
      {segments.map(({ width, x, y }) => (
        <div
          className={styles.segment}
          key={`${color}${x}${y}${width}`}
          style={{ background: color, left: x, top: y, width }}
        />
      ))}
    </>
  ) : (
    <div
      className={styles.cursor}
      style={{ borderColor: color, left: position.x, top: position.y }}
    />
  );
};
