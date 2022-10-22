import cn from 'classnames';
import React, { FC } from 'react';
import { Position } from '~/platform/interfaces/Position';
import styles from './Elements.module.scss';

const POSITIONS = ['16%', '50%', '84%'];

interface Props {
  highlighted?: boolean;
  position: Position<number>;
}

export const Cross: FC<Props> = ({ highlighted = false, position }) => {
  const { x, y } = position;

  return (
    <svg
      className={cn(styles.element, { [styles.highlighted]: highlighted })}
      style={{ left: POSITIONS[x], top: POSITIONS[y] }}
      viewBox="0 0 47 47"
    >
      <path d="m 7 7 c 13.997 8.0274 24.126 20.941 35.501 32.067-5.0023 5.1446-8.1484-4.5391-12.174-7.0382-7.8904-8.6046-16.21-17.311-26.646-22.805 1.1062-0.74112 2.2125-1.4822 3.3187-2.2234z" />
      <path d="m 41 5 c -7.959 10.161-16.78 19.562-26.069 28.517-1.2818 3.5348-13.126 11.787-6.1696 4.3785 9.3163-10.012 19.514-19.264 27.705-30.302 0.93428-1.594 3.0327-1.7455 4.5343-2.5933z" />
    </svg>
  );
};

export const Grid: FC = () => (
  <svg className={styles.grid} viewBox="0 0 184 184">
    <path d="m 60 2 v 180" />
    <path d="m 122 2 v 180" />
    <path d="m 2 60 h 180" />
    <path d="m 2 122 h 180" />
  </svg>
);

export const Round: FC<Props> = ({ highlighted = false, position }) => {
  const { x, y } = position;

  return (
    <svg
      className={cn(styles.element, { [styles.highlighted]: highlighted })}
      style={{ left: POSITIONS[x], top: POSITIONS[y] }}
      viewBox="0 0 47 47"
    >
      <path d="m 25 8 c -2.674-0.49567-11.991 2.1652-10.445 1.917 2.4912-1.9686-6.2231 6.5825-4.5363 10.505-1.1832 10.746 10.21 16.955 19.349 18.04 2.3204 0.20924 8.5927-2.755 3.2503-0.15573 5.7404-7.2532 4.2259-19.119-1.8802-25.894-3.8397-2.3743-11.256-7.701-3.2584-6.8878 9.01 4.1554 14.036 14.755 11.639 24.365-0.30497 10.69-15.099 13.553-22.468 7.754-9.5682-3.1538-13.041-15.405-7.6938-23.579 3.3869-6.0303 15.195-9.1522 18.453-7.815l-2.4103 1.7512z" />{' '}
    </svg>
  );
};
