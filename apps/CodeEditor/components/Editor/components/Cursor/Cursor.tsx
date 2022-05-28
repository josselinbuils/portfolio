import { FC, useLayoutEffect, useState } from 'react';
import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { Position } from '~/platform/interfaces/Position';
import { getOffsetPosition } from '../../utils/getOffsetPosition';

import styles from './Cursor.module.scss';

const END_LINE_SPACE_PX = 7;

interface Props {
  code: string;
  color: string;
  parent: HTMLTextAreaElement;
  selection: Selection;
}

interface Segment extends Position<number> {
  width: number;
}

export const Cursor: FC<Props> = ({ code, color, parent, selection }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [segments, setSegments] = useState<Segment[]>([]);

  useLayoutEffect(() => {
    setPosition(getOffsetPosition(parent, selection[0]));
  }, [selection, parent]);

  useLayoutEffect(() => {
    const newSegments = [] as Segment[];
    let segmentStartPosition: Position<number> | undefined;

    for (let offset = selection[0]; offset <= selection[1]; offset++) {
      const isLineEnd = code[offset] === '\n';
      const isLastOffset = offset === selection[1];

      if (segmentStartPosition === undefined) {
        segmentStartPosition = getOffsetPosition(parent, offset);
      }
      if (isLineEnd || isLastOffset) {
        newSegments.push({
          ...segmentStartPosition,
          width:
            getOffsetPosition(parent, offset).x -
            segmentStartPosition.x +
            (isLineEnd && !isLastOffset ? END_LINE_SPACE_PX : 0),
        });
        segmentStartPosition = undefined;
      }
    }
    setSegments(newSegments);
  }, [code, parent, selection]);

  return segments.length > 0 ? (
    <>
      {segments.map(({ width, x, y }) => (
        <div
          className={styles.segment}
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
