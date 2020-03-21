import { LUTColor } from '../constants';

export interface LUTComponent {
  color: LUTColor;
  end: number;
  start: number;
}
