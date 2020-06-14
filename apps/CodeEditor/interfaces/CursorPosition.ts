import { Position } from '~/platform/interfaces/Position';

export interface CursorPosition extends Position<number> {
  offset: number;
}
