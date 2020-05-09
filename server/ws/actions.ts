import { ClientCursor } from './interfaces/ClientCursor';
import { ClientState } from './interfaces/ClientState';
import { Diff } from './interfaces/Diff';

export const ACTION_SET_SHARED_STATE = 'SET_SHARED_STATE';
export const ACTION_REDO = 'REDO';
export const ACTION_UNDO = 'UNDO';
export const ACTION_UPDATE_CURSOR_OFFSET = 'UPDATE_CURSOR_OFFSET';
export const ACTION_UPDATE_CURSORS = 'UPDATE_CURSORS';
export const ACTION_UPDATE_SHARED_STATE = 'UPDATE_SHARED_STATE';

export const actionCreators = {
  setSharedState: (state: Partial<ClientState>): SetSharedStateAction => ({
    type: ACTION_SET_SHARED_STATE,
    payload: { state },
  }),
  updateClientState: (
    diffObj: Diff,
    cursorOffset?: number
  ): UpdateSharedStateAction => {
    const action = {
      type: ACTION_UPDATE_SHARED_STATE,
      payload: { diffObj },
    } as UpdateSharedStateAction;

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
  | SetSharedStateAction
  | UndoAction
  | UpdateCursorOffsetAction
  | UpdateCursorsAction
  | UpdateSharedStateAction;

interface RedoAction {
  type: typeof ACTION_REDO;
}

interface SetSharedStateAction {
  type: typeof ACTION_SET_SHARED_STATE;
  payload: { state: Partial<ClientState> };
}

interface UndoAction {
  type: typeof ACTION_UNDO;
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

interface UpdateSharedStateAction {
  type: typeof ACTION_UPDATE_SHARED_STATE;
  payload: {
    cursorOffset?: number;
    diffObj: Diff;
    safetyHash?: number;
  };
}
