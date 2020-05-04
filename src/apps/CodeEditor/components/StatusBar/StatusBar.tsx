import cn from 'classnames';
import React, { FC } from 'react';
import { Position } from '~/platform/interfaces';

import styles from './StatusBar.module.scss';

export const StatusBar: FC<Props> = ({ className, cursorPosition }) => {
  const { x, y } = cursorPosition;
  return (
    <div className={cn(styles.statusBar, className)}>
      {x}:{y}
    </div>
  );
};

interface Props {
  className?: string;
  cursorPosition: Position<number>;
}
