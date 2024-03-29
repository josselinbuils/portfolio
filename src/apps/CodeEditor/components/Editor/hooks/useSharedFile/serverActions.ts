import { type Selection } from '@/apps/CodeEditor/interfaces/Selection';
import { type Diff } from '@/apps/CodeEditor/utils/diffs';
import { createActionFactory } from '@/platform/state/utils/createActionFactory';

export interface SharedFileServerBaseAction {
  f: string; // filename
}

export const redo =
  createActionFactory<SharedFileServerBaseAction>('SHARED_FILE:REDO');

export const subscribe = createActionFactory<SharedFileServerBaseAction>(
  'SHARED_FILE:SUBSCRIBE',
);

export const undo =
  createActionFactory<SharedFileServerBaseAction>('SHARED_FILE:UNDO');

export const updateClientSelection = createActionFactory<
  SharedFileServerBaseAction & {
    cid?: number; // clientID
    s: number | Selection; // selection
  }
>('SHARED_FILE:UPDATE_CLIENT_SELECTION');

export const updateCode = createActionFactory<
  SharedFileServerBaseAction & {
    cs?: Selection; // currentSelection
    d: Diff[]; // diffs
    ns?: Selection; // newSelection
    sh?: string; // safetyHash
  }
>('SHARED_FILE:UPDATE_CODE');
