import React, { forwardRef } from 'preact/compat';
import styles from './ProgressBar.module.scss';

export interface ProgressBarProps {
  progress: number;
  onSeekStart(downEvent: MouseEvent | TouchEvent): void;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ onSeekStart, progress }, ref) => (
    <div
      className={styles.progressBar}
      onMouseDown={onSeekStart}
      onTouchStart={onSeekStart}
      ref={ref}
      role="progressbar"
      tabIndex={0}
    >
      <div className={styles.barContainer}>
        <div className={styles.bar} style={{ width: `${progress}%` }} />
      </div>
    </div>
  ),
);
