import { forwardRef } from 'preact/compat';

import classes from './ProgressBar.module.css';

export type ProgressBarProps = {
  onSeekStart(downEvent: MouseEvent | TouchEvent): void;
  progress: number;
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ onSeekStart, progress }, ref) => (
    <div
      className={classes.progressBar}
      onMouseDown={onSeekStart}
      onTouchStart={onSeekStart}
      ref={ref}
      role="progressbar"
      tabIndex={0}
    >
      <div className={classes.barContainer}>
        <div className={classes.bar} style={{ width: `${progress}%` }} />
      </div>
    </div>
  ),
);
