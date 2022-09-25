import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { Diff } from '~/apps/CodeEditor/utils/diffs';
import { createActionFactory } from '~/platform/state/utils/createActionFactory';

export const redo = createActionFactory<{
  f: string; // filename
}>('REDO');

export const subscribe = createActionFactory<{
  f: string; // filename
}>('SUBSCRIBE');

export const undo = createActionFactory<{
  f: string; // filename
}>('UNDO');

export const updateClientSelection = createActionFactory<{
  cid?: number; // clientID
  f: string; // filename
  s: number | Selection; // selection
}>('UPDATE_CLIENT_SELECTION');

export const updateCode = createActionFactory<{
  cs?: Selection; // currentSelection
  d: Diff[]; // diffs
  f: string; // filename
  ns?: Selection; // newSelection
  sh?: string; // safetyHash
}>('UPDATE_CODE');
