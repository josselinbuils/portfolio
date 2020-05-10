import { Reducer } from 'react';
import { Diff } from '../../interfaces/Diff';
import { applyDiff } from '../../utils/applyDiff';
import { ClientCursor } from './ClientCursor';
import { ClientState } from './ClientState';

const ACTION_REDO = 'REDO';
const ACTION_UNDO = 'UNDO';
const ACTION_UPDATE_CLIENT_STATE = 'UPDATE_CLIENT_STATE';
const ACTION_UPDATE_CODE = 'UPDATE_CODE';
const ACTION_UPDATE_CURSOR_OFFSET = 'UPDATE_CURSOR_OFFSET';
const ACTION_UPDATE_CURSORS = 'UPDATE_CURSORS';

export const createAction = {
  redo: (): RedoAction => ({ type: ACTION_REDO }),
  undo: (): UndoAction => ({ type: ACTION_UNDO }),
  updateClientState: (
    state: Partial<ClientState>
  ): UpdateClientStateAction => ({
    type: ACTION_UPDATE_CLIENT_STATE,
    payload: { state },
  }),
  updateCode: (
    code: string | Diff,
    cursorOffset: number,
    safetyHash: number
  ): UpdateCodeAction => {
    const action = {
      type: ACTION_UPDATE_CODE,
      payload: {
        cursorOffset,
        safetyHash,
      },
    } as UpdateCodeAction;

    if (typeof code === 'string') {
      action.payload.code = code;
    } else {
      action.payload.diffObj = code;
    }
    return action;
  },
  updateCursorOffset: (cursorOffset: number): UpdateCursorOffsetAction => ({
    type: ACTION_UPDATE_CURSOR_OFFSET,
    payload: { cursorOffset },
  }),
};

export const handleAction = {
  [ACTION_UPDATE_CLIENT_STATE]: (state, action: UpdateClientStateAction) => ({
    ...state,
    ...action.payload.state,
  }),

  [ACTION_UPDATE_CODE]: (state: ClientState, action: UpdateCodeAction) => {
    const { cursorOffset = state.cursorOffset, diffObj } = action.payload;
    let { code } = action.payload;

    if (code === undefined) {
      code = applyDiff(state.code, diffObj as Diff);
    }
    return { ...state, code, cursorOffset };
  },

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
} as { [action: string]: Reducer<ClientState, Action> };

export type Action =
  | RedoAction
  | UndoAction
  | UpdateClientStateAction
  | UpdateCodeAction
  | UpdateCursorOffsetAction
  | UpdateCursorsAction;

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
    diffObj?: Diff;
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
