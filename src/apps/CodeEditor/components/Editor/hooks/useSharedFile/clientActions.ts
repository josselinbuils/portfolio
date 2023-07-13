import { type ClientCursor } from '@/apps/CodeEditor/interfaces/ClientCursor';
import { type ClientState } from '@/apps/CodeEditor/interfaces/ClientState';
import { type Selection } from '@/apps/CodeEditor/interfaces/Selection';
import { createSelection } from '@/apps/CodeEditor/utils/createSelection';
import { type Diff } from '@/apps/CodeEditor/utils/diffs';
import { applyDiff } from '@/apps/CodeEditor/utils/diffs';
import { createActionManager } from '@/platform/state/utils/createActionManager';

export const applyState = createActionManager<
  ClientState,
  {
    s: Partial<ClientState>; // state
  }
>('SHARED_FILE:APPLY_STATE', (state, action) => ({
  ...state,
  ...action[1].s,
}));

export const applyCodeChange = createActionManager<
  ClientState,
  {
    d: Diff[]; // diffs
    ns?: Selection; // newSelection
  }
>('SHARED_FILE:APPLY_CODE_CHANGE', (state, action) => {
  const { d: diffs, ns: newSelection = state.selection } = action[1];
  const code = diffs.reduce(applyDiff, state.code);
  return { ...state, code, selection: newSelection };
});

export const applyForeignCursors = createActionManager<
  ClientState,
  {
    c: ClientCursor[]; // cursors
  }
>('SHARED_FILE:APPLY_FOREIGN_CURSORS', (state, action) => ({
  ...state,
  cursors: action[1].c,
}));

export const applyForeignSelection = createActionManager<
  ClientState,
  {
    cid: number; // clientID
    s: number | Selection; // selection
  }
>('SHARED_FILE:APPLY_FOREIGN_SELECTION', (state, action) => {
  const { cid: clientID, s } = action[1];
  const cursorToEdit = state.cursors.find(
    (cursor) => cursor.clientID === clientID,
  );

  if (cursorToEdit !== undefined) {
    cursorToEdit.selection = createSelection(s);
  }
  return { ...state, cursors: [...state.cursors] };
});

export const applySelection = createActionManager<
  ClientState,
  {
    s: number | Selection; // selection
  }
>('SHARED_FILE:APPLY_SELECTION', (state, action) => ({
  ...state,
  selection: createSelection(action[1].s),
}));
