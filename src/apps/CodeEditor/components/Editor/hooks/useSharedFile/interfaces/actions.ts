import { Diff } from '../../../utils/diffs';
import { ClientCursor } from './ClientCursor';
import { ClientState } from './ClientState';

export const ACTION_REDO = 'REDO';
export const ACTION_UNDO = 'UNDO';
export const ACTION_UPDATE_CLIENT_STATE = 'UPDATE_CLIENT_STATE';
export const ACTION_UPDATE_CODE = 'UPDATE_CODE';
export const ACTION_UPDATE_CURSOR_OFFSET = 'UPDATE_CURSOR_OFFSET';
export const ACTION_UPDATE_CURSORS = 'UPDATE_CURSORS';

export type Action =
  | RedoAction
  | UndoAction
  | UpdateClientStateAction
  | UpdateCodeAction
  | UpdateCursorOffsetAction
  | UpdateCursorsAction;

export interface RedoAction {
  type: typeof ACTION_REDO;
}

export interface UndoAction {
  type: typeof ACTION_UNDO;
}

export interface UpdateClientStateAction {
  type: typeof ACTION_UPDATE_CLIENT_STATE;
  payload: {
    state: Partial<ClientState>;
  };
}

export interface UpdateCodeAction {
  type: typeof ACTION_UPDATE_CODE;
  payload: {
    cursorOffset?: number;
    diffs: Diff[];
    safetyHash?: number;
  };
}

export interface UpdateCursorOffsetAction {
  type: typeof ACTION_UPDATE_CURSOR_OFFSET;
  payload: {
    clientID?: number;
    cursorOffset: number;
  };
}

export interface UpdateCursorsAction {
  type: typeof ACTION_UPDATE_CURSORS;
  payload: {
    cursors: ClientCursor[];
  };
}
