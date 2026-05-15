import { forwardRef } from 'preact/compat';

import styles from './ProgressBar.module.css';

export type ProgressBarProps = {
  onSeekStart(downEvent: MouseEvent | TouchEvent): void;
  progress: number;
};

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
