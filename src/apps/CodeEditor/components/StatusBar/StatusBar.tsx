import cn from 'classnames';
import React, { FC } from 'react';
import { CursorPosition } from '../../interfaces/CursorPosition';

import styles from './StatusBar.module.scss';

export const StatusBar: FC<Props> = ({ className, cursorPosition }) => {
  const { offset, x, y } = cursorPosition;
  return (
    <div className={cn(styles.statusBar, className)}>
      {x}:{y} [{offset}]
    </div>
  );
};

interface Props {
  className?: string;
  cursorPosition: CursorPosition;
}
