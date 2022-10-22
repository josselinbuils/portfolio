import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import type { Position } from '~/platform/interfaces/Position';
import { getOffsetPosition } from '../../utils/getOffsetPosition';
import styles from './Cursor.module.scss';
import type { Segment } from './utils/computeSegments';
import { computeSegments } from './utils/computeSegments';

interface Props {
  code: string;
  color: string;
  parent: HTMLTextAreaElement;
  selection: Selection;
}

export const Cursor: FC<Props> = ({ code, color, parent, selection }) => {
  const [position, setPosition] = useState<Position<number> | undefined>();
  const [segments, setSegments] = useState<Segment[]>([]);

  useEffect(() => {
    setPosition(getOffsetPosition(code, parent, selection[0]));
    setSegments(computeSegments(code, selection, parent));
  }, [code, parent, parent.clientWidth, parent.clientHeight, selection]);

  if (segments.length > 0) {
    return (
      <>
        {segments.map(({ width, x, y }) => (
          <div
            className={styles.segment}
            key={`${color}${x}${y}${width}`}
            style={{ background: color, left: x, top: y, width }}
          />
        ))}
      </>
    );
  }

  return position ? (
    <div
      className={styles.cursor}
      style={{ borderColor: color, left: position.x, top: position.y }}
    />
  ) : null;
};
