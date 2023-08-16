import cn from 'classnames';
import { type FC } from 'preact/compat';
import { type CursorPosition } from '../../interfaces/CursorPosition';
import styles from './StatusBar.module.scss';

const DEBUG = true;

export interface StatusBarProps {
  className?: string;
  cursorPosition: CursorPosition;
}

export const StatusBar: FC<StatusBarProps> = ({
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
