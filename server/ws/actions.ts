import { ClientCursor } from './interfaces/ClientCursor';
import { ClientState } from './interfaces/ClientState';
import { Diff } from './utils/diffs';

export const ACTION_REDO = 'REDO';
export const ACTION_UNDO = 'UNDO';
export const ACTION_UPDATE_CLIENT_STATE = 'UPDATE_CLIENT_STATE';
export const ACTION_UPDATE_CODE = 'UPDATE_CODE';
export const ACTION_UPDATE_CURSOR_OFFSET = 'UPDATE_CURSOR_OFFSET';
export const ACTION_UPDATE_CURSORS = 'UPDATE_CURSORS';

export const createAction = {
  updateClientState: (
    state: Partial<ClientState>
  ): UpdateClientStateAction => ({
    type: ACTION_UPDATE_CLIENT_STATE,
    payload: { state },
  }),
  updateCode: (
    code: string | Diff,
    cursorOffset?: number
  ): UpdateCodeAction => {
    const action = {
      type: ACTION_UPDATE_CODE,
      payload: {},
    } as UpdateCodeAction;

    if (typeof code === 'string') {
      action.payload.code = code;
    } else {
      action.payload.diff = code;
    }
    if (cursorOffset !== undefined) {
      action.payload.cursorOffset = cursorOffset;
    }
    return action;
  },
  updateCursorOffset: (
    clientID: number,
    cursorOffset: number
  ): UpdateCursorOffsetAction => ({
    type: ACTION_UPDATE_CURSOR_OFFSET,
    payload: { clientID, cursorOffset },
  }),
  updateCursors: (cursors: ClientCursor[]): UpdateCursorsAction => ({
    type: ACTION_UPDATE_CURSORS,
    payload: { cursors },
  }),
};

export type Action =
  | RedoAction
  | UndoAction
  | UpdateClientStateAction
  | UpdateCursorOffsetAction
  | UpdateCursorsAction
  | UpdateCodeAction;

interface RedoAction {
  type: typeof ACTION_REDO;
}

interface UndoAction {
  type: typeof ACTION_UNDO;
}

interface UpdateClientStateAction {
  type: typeof ACTION_UPDATE_CLIENT_STATE;
  payload: {
    state: Partial<ClientState>;
  };
}

interface UpdateCodeAction {
  type: typeof ACTION_UPDATE_CODE;
  payload: {
    code?: string;
    cursorOffset?: number;
    diff?: Diff;
    safetyHash?: number;
  };
}

interface UpdateCursorOffsetAction {
  type: typeof ACTION_UPDATE_CURSOR_OFFSET;
  payload: {
    clientID?: number;
    cursorOffset: number;
  };
}

interface UpdateCursorsAction {
  type: typeof ACTION_UPDATE_CURSORS;
  payload: {
    cursors: ClientCursor[];
  };
}
