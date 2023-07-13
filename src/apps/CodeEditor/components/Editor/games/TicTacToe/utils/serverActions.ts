import { createActionFactory } from '@/platform/state/utils/createActionFactory';
import { type Mark } from './GameManager';

export const subscribe = createActionFactory('TIC_TAC_TOE:SUBSCRIBE');

export const placeMark = createActionFactory<{
  mark: Mark;
  x: number;
  y: number;
}>('TIC_TAC_TOE:PLACE_MARK');

export const reset = createActionFactory('TIC_TAC_TOE:RESET');
