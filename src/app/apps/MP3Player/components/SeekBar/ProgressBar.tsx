import cn from 'classnames';
import React, { FC } from 'react';
import styles from './ProgressBar.module.scss';

export const ProgressBar: FC<ProgressBarProps> = ({
  min,
  onSeekStart,
  progress
}) => (
  <div
    className={cn(styles.progressBar, { [styles.min]: min })}
    onMouseDown={onSeekStart}
  >
    <div className={styles.barContainer}>
      <div className={styles.bar} style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export interface ProgressBarProps {
  min: boolean;
  progress: number;
  onSeekStart(): void;
}
