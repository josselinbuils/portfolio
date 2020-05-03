import React, { FC, useLayoutEffect, useState } from 'react';
import { Position } from '~/platform/interfaces';
// Needs to import directly from getCursorPosition to avoid webpack crash
import { getCursorPosition } from '../../utils/getCursorPosition';

import styles from './Cursor.module.scss';

export const Cursor: FC<Props> = ({ color, offset, parent }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    setPosition(getCursorPosition(parent, offset));
  }, [offset, parent]);

  return (
    <div
      className={styles.cursor}
      style={{ borderColor: color, left: position.x, top: position.y }}
    />
  );
};

interface Props {
  color: string;
  offset: number;
  parent: HTMLTextAreaElement;
}
