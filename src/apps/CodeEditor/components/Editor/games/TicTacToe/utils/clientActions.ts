import { createActionFactory } from '@/platform/state/utils/createActionFactory';
import { type Grid } from './GameManager';

export const apply = createActionFactory<Grid>('TIC_TAC_TOE:APPLY');
