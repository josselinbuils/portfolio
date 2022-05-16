import { Diff } from '../utils/diffs';
import { ClientCursor } from './ClientCursor';
import { ClientState } from './ClientState';
import { Selection } from './Selection';

const isDev = process.env.NODE_ENV === 'development';

export const ACTION_REDO = isDev ? 'ACTION_REDO' : 0;
export const ACTION_UNDO = isDev ? 'ACTION_UNDO' : 1;
export const ACTION_UPDATE_CLIENT_STATE = isDev
  ? 'ACTION_UPDATE_CLIENT_STATE'
  : 2;
export const ACTION_UPDATE_CODE = isDev ? 'ACTION_UPDATE_CODE' : 3;
export const ACTION_UPDATE_CURSORS = isDev ? 'ACTION_UPDATE_CURSORS' : 4;
export const ACTION_UPDATE_SELECTION = isDev ? 'ACTION_UPDATE_SELECTION' : 5;

export type Action =
  | RedoAction
  | UndoAction
  | UpdateClientStateAction
  | UpdateCodeAction
  | UpdateCursorsAction
  | UpdateSelectionAction;

export type RedoAction = [typeof ACTION_REDO];

export type UndoAction = [typeof ACTION_UNDO];

export type UpdateClientStateAction = [
  typeof ACTION_UPDATE_CLIENT_STATE,
  {
    s: Partial<ClientState>; // state
  }
];

export type UpdateCodeAction = [
  typeof ACTION_UPDATE_CODE,
  {
    cs?: Selection; // currentSelection
    d: Diff[]; // diffs
    ns?: Selection; // newSelection
    sh?: number; // safetyHash
  }
];

export type UpdateCursorsAction = [
  typeof ACTION_UPDATE_CURSORS,
  {
    c: ClientCursor[]; // cursors
  }
];

export type UpdateSelectionAction = [
  typeof ACTION_UPDATE_SELECTION,
  {
    cid?: number; // clientID
    s: number | Selection; // selection
  }
];
