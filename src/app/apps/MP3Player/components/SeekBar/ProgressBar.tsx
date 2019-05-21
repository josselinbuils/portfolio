import React, { FC } from 'react';
import styles from './ProgressBar.module.scss';

export const ProgressBar: FC<ProgressBarProps> = ({
  onSeekStart,
  progress
}) => (
  <div className={styles.progressBar} onMouseDown={onSeekStart}>
    <div className={styles.barContainer}>
      <div className={styles.bar} style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export interface ProgressBarProps {
  progress: number;
  onSeekStart(): void;
}
