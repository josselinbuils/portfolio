import { type FC } from 'preact/compat';
import { type Position } from '@/platform/interfaces/Position';

const POSITIONS = ['16%', '50%', '84%'];

export interface CrossProps {
  highlighted?: boolean;
  position: Position<number>;
}

export const Cross: FC<CrossProps> = ({ highlighted = false, position }) => {
  const { x, y } = position;

  return (
    <g
      fill={!highlighted ? '#c3c3c3' : undefined}
      stroke={!highlighted ? '#c3c3c3' : undefined}
      strokeWidth={2}
      style={{
        transform: `translate(calc(${POSITIONS[x]} - 13%), calc(${POSITIONS[y]} - 13%))`,
      }}
    >
      <path d="m 7 7 c 13.997 8.0274 24.126 20.941 35.501 32.067-5.0023 5.1446-8.1484-4.5391-12.174-7.0382-7.8904-8.6046-16.21-17.311-26.646-22.805 1.1062-0.74112 2.2125-1.4822 3.3187-2.2234z" />
      <path d="m 41 5 c -7.959 10.161-16.78 19.562-26.069 28.517-1.2818 3.5348-13.126 11.787-6.1696 4.3785 9.3163-10.012 19.514-19.264 27.705-30.302 0.93428-1.594 3.0327-1.7455 4.5343-2.5933z" />
    </g>
  );
};
