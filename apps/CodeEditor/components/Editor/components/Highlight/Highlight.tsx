import React, { FC, useLayoutEffect, useState } from 'react';
import { Position } from '~/platform/interfaces/Position';
import { getOffsetPosition } from '../../utils/getOffsetPosition';

import styles from './Highlight.module.scss';

const END_LINE_SPACE_PX = 7;

export const Highlight: FC<Props> = ({
  code,
  color,
  endOffset,
  parent,
  startOffset,
}) => {
  const [segments, setSegments] = useState<Segment[]>([]);

  useLayoutEffect(() => {
    const newSegments = [] as Segment[];
    let segmentStartPosition: Position<number> | undefined;

    for (let offset = startOffset; offset <= endOffset; offset++) {
      const isLineEnd = code[offset] === '\n';
      const isLastOffset = offset === endOffset;

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
  }, [endOffset, parent, startOffset]);

  return (
    <>
      {segments.map(({ width, x, y }) => (
        <div
          className={styles.segment}
          style={{ background: color, left: x, top: y, width }}
        />
      ))}
    </>
  );
};

interface Props {
  code: string;
  color: string;
  endOffset: number;
  parent: HTMLTextAreaElement;
  startOffset: number;
}

interface Segment extends Position<number> {
  width: number;
}
