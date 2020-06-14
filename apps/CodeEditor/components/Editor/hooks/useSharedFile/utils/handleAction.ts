import { Reducer } from 'react';
import { applyDiff } from '~/apps/CodeEditor/components/Editor/utils/diffs';
import {
  Action,
  ACTION_UPDATE_CLIENT_STATE,
  ACTION_UPDATE_CODE,
  ACTION_UPDATE_CURSORS,
  ACTION_UPDATE_CURSOR_OFFSET,
  UpdateClientStateAction,
  UpdateCodeAction,
  UpdateCursorOffsetAction,
  UpdateCursorsAction,
} from '../interfaces/actions';
import { ClientCursor } from '../interfaces/ClientCursor';
import { ClientState } from '../interfaces/ClientState';

export const handleAction = {
  [ACTION_UPDATE_CLIENT_STATE]: (state, action: UpdateClientStateAction) => ({
    ...state,
    ...action.payload.state,
  }),

  [ACTION_UPDATE_CODE]: (state: ClientState, action: UpdateCodeAction) => {
    const { cursorOffset = state.cursorOffset, diffs } = action.payload;
    const code = diffs.reduce(applyDiff, state.code);
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
