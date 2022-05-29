import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { Diff } from '~/apps/CodeEditor/utils/diffs';
import { createActionFactory } from '~/platform/state/utils/createActionFactory';

export const redo = createActionFactory('REDO');

export const undo = createActionFactory('UNDO');

export const updateClientSelection = createActionFactory<{
  cid?: number; // clientID
  s: number | Selection; // selection
}>('UPDATE_CLIENT_SELECTION');

export const updateCode = createActionFactory<{
  cs?: Selection; // currentSelection
  d: Diff[]; // diffs
  ns?: Selection; // newSelection
  sh?: string; // safetyHash
}>('UPDATE_CODE');
