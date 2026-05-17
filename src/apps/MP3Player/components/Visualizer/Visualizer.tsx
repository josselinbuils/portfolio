import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';

import classes from './Visualizer.module.css';

const BAR_COUNT = 19;
const MIN_HEIGHT = 8;
const MAX_HEIGHT = 100;

export type VisualizerProps = {
  className?: string;
  peaks?: number[];
  playing: boolean;
  progress: number;
};

function computeBarHeights(peaks: number[], progress: number): number[] {
  const maxPeak = peaks.reduce((max, value) => Math.max(max, value), 0);
  const currentPeakIndex = Math.ceil((progress / 100) * (peaks.length - 1));

  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const barPeak = peaks[currentPeakIndex - BAR_COUNT + i];
    return MIN_HEIGHT + (barPeak / maxPeak) * (MAX_HEIGHT - MIN_HEIGHT);
  });
}

export const Visualizer: FunctionComponent<VisualizerProps> = ({
  className,
  peaks,
  playing,
  progress,
}) => {
  const barHeights = useMemo(
    () =>
      peaks && peaks.length > 0
        ? computeBarHeights(peaks, progress)
        : undefined,
    [peaks, progress],
  );

  return (
    <div
      className={cn(classes.visualizer, className, {
        [classes.playing]: playing,
        [classes.waveform]: barHeights !== undefined,
      })}
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span
          className={classes.bar}
          key={index}
          style={
            barHeights !== undefined
              ? { height: `${barHeights[index].toFixed(1)}%` }
              : undefined
          }
        />
      ))}
    </div>
  );
};
