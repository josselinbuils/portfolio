import React, { FC, useEffect, useState } from 'react';
import { useEventListener } from '~/platform/hooks/useEventListener';
import { Position } from '~/platform/interfaces/Position';

import styles from './Selection.module.scss';

export const Selection: FC<Props> = ({ visible }) => {
  const [cursorPosition, setCursorPosition] = useState<Position<number>>();
  const [cursorStartPosition, setCursorStartPosition] = useState<
    Position<number>
  >();

  useEffect(() => {
    if (!visible) {
      setCursorPosition(undefined);
      setCursorStartPosition(undefined);
    }
  }, [visible]);

  useEventListener(
    'mousemove',
    (moveEvent: MouseEvent) => {
      const position = {
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };

      if (cursorStartPosition === undefined) {
        setCursorStartPosition(position);
      }
      setCursorPosition(position);
    },
    visible
  );

  return cursorPosition !== undefined && cursorStartPosition !== undefined ? (
    <div
      className={styles.selection}
      style={{
        height: Math.abs(cursorPosition.y - cursorStartPosition.y),
        left: Math.min(cursorStartPosition.x, cursorPosition.x),
        top: Math.min(cursorStartPosition.y, cursorPosition.y),
        width: Math.abs(cursorPosition.x - cursorStartPosition.x),
      }}
    />
  ) : null;
};

interface Props {
  visible: boolean;
}
