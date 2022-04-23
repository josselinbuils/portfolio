import React, { forwardRef } from 'react';

import styles from './ProgressBar.module.scss';

export const ProgressBar = forwardRef<HTMLDivElement, Props>(
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
  )
);

interface Props {
  progress: number;
  onSeekStart(downEvent: React.MouseEvent | React.TouchEvent): void;
}
