import { type FC, useState } from 'preact/compat';
import { useEventListener } from '@/platform/hooks/useEventListener';
import { type Position } from '@/platform/interfaces/Position';
import styles from './Selection.module.scss';

export interface SelectionProps {
  startPosition: Position<number>;
}

export const Selection: FC<SelectionProps> = ({ startPosition }) => {
  const [cursorPosition, setCursorPosition] = useState<Position<number>>();

  useEventListener('mousemove', (moveEvent: MouseEvent) => {
    setCursorPosition({
      x: moveEvent.clientX,
      y: moveEvent.clientY,
    });
  });

  return cursorPosition !== undefined ? (
    <div
      className={styles.selection}
      style={{
        height: Math.abs(cursorPosition.y - startPosition.y),
        left: Math.min(startPosition.x, cursorPosition.x),
        top: Math.min(startPosition.y, cursorPosition.y),
        width: Math.abs(cursorPosition.x - startPosition.x),
      }}
    />
  ) : null;
};
