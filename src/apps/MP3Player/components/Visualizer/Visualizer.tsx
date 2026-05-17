import cn from 'classnames';
import { type FunctionComponent } from 'preact';

import classes from './Visualizer.module.css';

const BAR_COUNT = 19;
const bars = Array.from({ length: BAR_COUNT }, (_, index) => index);

export type VisualizerProps = {
  className?: string;
  playing: boolean;
};

export const Visualizer: FunctionComponent<VisualizerProps> = ({
  className,
  playing,
}) => (
  <div
    className={cn(classes.visualizer, className, {
      [classes.playing]: playing,
    })}
  >
    {bars.map((index) => (
      <span className={classes.bar} key={index} />
    ))}
  </div>
);
