import React, { FC } from 'react';
import styles from './ProgressBar.module.scss';

export const ProgressBar: FC<Props> = ({ onSeekStart, progress }) => (
  <div className={styles.progressBar} onMouseDown={onSeekStart}>
    <div className={styles.barContainer}>
      <div className={styles.bar} style={{ width: `${progress}%` }} />
    </div>
  </div>
);

interface Props {
  progress: number;
  onSeekStart(): void;
}
