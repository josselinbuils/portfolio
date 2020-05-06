import { Reducer } from 'react';
import { Diff } from '../../interfaces';
import { ClientCursor, ClientState } from './interfaces';
import { applyDiff } from './utils';

const ACTION_SET_SHARED_STATE = 'SET_SHARED_STATE';
const ACTION_UPDATE_SHARED_STATE = 'UPDATE_SHARED_STATE';
const ACTION_UPDATE_CURSOR_OFFSET = 'UPDATE_CURSOR_OFFSET';
const ACTION_UPDATE_CURSORS = 'UPDATE_CURSORS';

export const actionCreators = {
  setSharedState: (state: ClientState): SetSharedStateAction => ({
    type: ACTION_SET_SHARED_STATE,
    payload: { state },
  }),
  updateClientState: (
    diffObj: Diff,
    cursorOffset: number
  ): UpdateSharedStateAction => ({
    type: ACTION_UPDATE_SHARED_STATE,
    payload: {
      cursorOffset,
      diffObj,
    },
  }),
  updateCursorOffset: (cursorOffset: number): UpdateCursorOffsetAction => ({
    type: ACTION_UPDATE_CURSOR_OFFSET,
    payload: { cursorOffset },
  }),
};

export const actionsHandlers = {
  [ACTION_SET_SHARED_STATE]: (_, action: SetSharedStateAction) => {
    const { state } = action.payload;
    const cursors = state.cursors.filter(
      ({ clientID }) => clientID !== state.clientID
    );
    return { ...state, cursors };
  },

  [ACTION_UPDATE_CURSORS]: (
    state: ClientState,
    action: UpdateCursorsAction
  ) => {
    const cursors = action.payload.cursors.filter(
      ({ clientID }) => clientID !== state.clientID
    );
    // We don't care if only our cursor changed
    const haveCursorsChanged =
      JSON.stringify(cursors) !== JSON.stringify(state.cursors);

    return haveCursorsChanged ? { ...state, cursors } : state;
  },

  [ACTION_UPDATE_SHARED_STATE]: (
    state: ClientState,
    action: UpdateSharedStateAction
  ) => {
    const { cursorOffset, diffObj } = action.payload;
    return {
      ...state,
      code: applyDiff(state.code, diffObj),
      cursorOffset,
    };
  },
} as { [action: string]: Reducer<ClientState, Action> };

export type Action =
  | SetSharedStateAction
  | UpdateCursorOffsetAction
  | UpdateCursorsAction
  | UpdateSharedStateAction;

interface SetSharedStateAction {
  type: typeof ACTION_SET_SHARED_STATE;
  payload: { state: ClientState };
}

interface UpdateCursorOffsetAction {
  type: typeof ACTION_UPDATE_CURSOR_OFFSET;
  payload: {
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
    cursorOffset: number;
    diffObj: Diff;
  };
}
