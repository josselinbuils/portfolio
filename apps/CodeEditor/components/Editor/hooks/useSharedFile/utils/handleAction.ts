import { Reducer } from 'react';
import {
  Action,
  ACTION_UPDATE_CLIENT_STATE,
  ACTION_UPDATE_CODE,
  ACTION_UPDATE_CURSORS,
  ACTION_UPDATE_SELECTION,
  UpdateClientStateAction,
  UpdateCodeAction,
  UpdateCursorsAction,
  UpdateSelectionAction,
} from '~/apps/CodeEditor/interfaces/actions';
import { ClientState } from '~/apps/CodeEditor/interfaces/ClientState';
import { createSelection } from '~/apps/CodeEditor/utils/createSelection';
import { applyDiff } from '~/apps/CodeEditor/utils/diffs';

export const handleAction = {
  [ACTION_UPDATE_CLIENT_STATE]: (
    state: ClientState,
    action: UpdateClientStateAction
  ) => ({
    ...state,
    ...action[1].s,
  }),

  [ACTION_UPDATE_CODE]: (state: ClientState, action: UpdateCodeAction) => {
    const { d: diffs, ns: newSelection = state.selection } = action[1];
    const code = diffs.reduce(applyDiff, state.code);
    return { ...state, code, selection: newSelection };
  },

  [ACTION_UPDATE_CURSORS]: (
    state: ClientState,
    action: UpdateCursorsAction
  ) => ({ ...state, cursors: action[1].c }),

  [ACTION_UPDATE_SELECTION]: (
    state: ClientState,
    action: UpdateSelectionAction
  ) => {
    const { cid: clientID, s } = action[1];
    const selection = createSelection(s);

    if (clientID === state.id) {
      return { ...state, selection };
    }

    const cursorToEdit = state.cursors.find(
      (cursor) => cursor.clientID === clientID
    );
    if (cursorToEdit !== undefined) {
      cursorToEdit.selection = selection;
    }

    return { ...state };
  },
} as { [action: string | number]: Reducer<ClientState, Action> };
