import { Reducer } from 'react';
import { Diff } from '../../interfaces/Diff';
import { ClientCursor } from './interfaces/ClientCursor';
import { ClientState } from './interfaces/ClientState';
import { applyDiff } from './utils/applyDiff';

const ACTION_SET_SHARED_STATE = 'SET_SHARED_STATE';
const ACTION_REDO = 'REDO';
const ACTION_UNDO = 'UNDO';
const ACTION_UPDATE_SHARED_STATE = 'UPDATE_SHARED_STATE';
const ACTION_UPDATE_CURSOR_OFFSET = 'UPDATE_CURSOR_OFFSET';
const ACTION_UPDATE_CURSORS = 'UPDATE_CURSORS';

export const actionCreators = {
  redo: (): RedoAction => ({ type: ACTION_REDO }),
  setSharedState: (state: Partial<ClientState>): SetSharedStateAction => ({
    type: ACTION_SET_SHARED_STATE,
    payload: { state },
  }),
  undo: (): UndoAction => ({ type: ACTION_UNDO }),
  updateClientState: (
    diffObj: Diff,
    cursorOffset: number,
    safetyHash: number
  ): UpdateSharedStateAction => ({
    type: ACTION_UPDATE_SHARED_STATE,
    payload: {
      cursorOffset,
      diffObj,
      safetyHash,
    },
  }),
  updateCursorOffset: (cursorOffset: number): UpdateCursorOffsetAction => ({
    type: ACTION_UPDATE_CURSOR_OFFSET,
    payload: { cursorOffset },
  }),
};

export const actionsHandlers = {
  [ACTION_SET_SHARED_STATE]: (state, action: SetSharedStateAction) => ({
    ...state,
    ...action.payload.state,
  }),

  [ACTION_UPDATE_CURSOR_OFFSET]: (
    state: ClientState,
    action: UpdateCursorOffsetAction
  ) => {
    const { clientID, cursorOffset } = action.payload;

    if (clientID === state.id) {
      return { ...state, cursorOffset };
    }

    const cursorToEdit = state.cursors.find(
      (cursor) => cursor.clientID === clientID
    );
    (cursorToEdit as ClientCursor).offset = cursorOffset;

    return { ...state };
  },

  [ACTION_UPDATE_CURSORS]: (
    state: ClientState,
    action: UpdateCursorsAction
  ) => ({ ...state, cursors: action.payload.cursors }),

  [ACTION_UPDATE_SHARED_STATE]: (
    state: ClientState,
    action: UpdateSharedStateAction
  ) => {
    const { cursorOffset = state.cursorOffset, diffObj } = action.payload;
    return {
      ...state,
      code: applyDiff(state.code, diffObj),
      cursorOffset,
    };
  },
} as { [action: string]: Reducer<ClientState, Action> };

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

// TODO change that shitty name
interface UpdateSharedStateAction {
  type: typeof ACTION_UPDATE_SHARED_STATE;
  payload: {
    cursorOffset?: number;
    diffObj: Diff;
    safetyHash?: number;
  };
}
