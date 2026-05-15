import { type Position } from '@/platform/interfaces/Position';

export type CursorPosition = Position<number> & {
  offset: number;
};
