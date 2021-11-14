import { useEventListener } from '@josselinbuils/hooks/useEventListener';
import { FC, useState } from 'react';
import { Position } from '~/platform/interfaces/Position';

import styles from './Selection.module.scss';

export const Selection: FC = () => {
  const [cursorPosition, setCursorPosition] = useState<Position<number>>();
  const [cursorStartPosition, setCursorStartPosition] =
    useState<Position<number>>();

  useEventListener('mousemove', (moveEvent: MouseEvent) => {
    const position = {
      x: moveEvent.clientX,
      y: moveEvent.clientY,
    };

    if (cursorStartPosition === undefined) {
      setCursorStartPosition(position);
    }
    setCursorPosition(position);
  });

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
