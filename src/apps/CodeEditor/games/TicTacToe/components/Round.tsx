import { type FC } from 'preact/compat';
import { type Position } from '@/platform/interfaces/Position';

const POSITIONS = ['16%', '50%', '84%'];

export interface RoundProps {
  highlighted?: boolean;
  position: Position<number>;
}

export const Round: FC<RoundProps> = ({ highlighted = false, position }) => {
  const { x, y } = position;

  return (
    <path
      d="m 25 8 c -2.674-0.49567-11.991 2.1652-10.445 1.917 2.4912-1.9686-6.2231 6.5825-4.5363 10.505-1.1832 10.746 10.21 16.955 19.349 18.04 2.3204 0.20924 8.5927-2.755 3.2503-0.15573 5.7404-7.2532 4.2259-19.119-1.8802-25.894-3.8397-2.3743-11.256-7.701-3.2584-6.8878 9.01 4.1554 14.036 14.755 11.639 24.365-0.30497 10.69-15.099 13.553-22.468 7.754-9.5682-3.1538-13.041-15.405-7.6938-23.579 3.3869-6.0303 15.195-9.1522 18.453-7.815l-2.4103 1.7512z"
      fill={!highlighted ? '#c3c3c3' : undefined}
      stroke={!highlighted ? '#c3c3c3' : undefined}
      strokeWidth={2}
      style={{
        transform: `translate(calc(${POSITIONS[x]} - 13%), calc(${POSITIONS[y]} - 13%))`,
      }}
    />
  );
};
