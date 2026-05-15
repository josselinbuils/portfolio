import cn from 'classnames';
import { type FunctionComponent } from 'preact';

import { type CursorPosition } from '../../interfaces/CursorPosition';
import styles from './StatusBar.module.css';

const DEBUG = true;

export type StatusBarProps = {
  className?: string;
  cursorPosition: CursorPosition;
};

export const StatusBar: FunctionComponent<StatusBarProps> = ({
  className,
  cursorPosition,
}) => {
  const { offset, x, y } = cursorPosition;
  return (
    <div className={cn(styles.statusBar, className)}>
      {x}:{y}
      {DEBUG && ` (${offset})`}
    </div>
  );
};
