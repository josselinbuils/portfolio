import {
  ACTION_UPDATE_CLIENT_STATE,
  ACTION_UPDATE_CODE,
  ACTION_UPDATE_CURSORS,
  ACTION_UPDATE_CURSOR_OFFSET,
  UpdateClientStateAction,
  UpdateCodeAction,
  UpdateCursorOffsetAction,
  UpdateCursorsAction,
} from '../../components/Editor/hooks/useSharedFile/interfaces/actions';
import { ClientCursor } from '../../components/Editor/hooks/useSharedFile/interfaces/ClientCursor';
import { ClientState } from '../../components/Editor/hooks/useSharedFile/interfaces/ClientState';
import { Diff } from '../../components/Editor/utils/diffs';

export const createAction = {
  updateClientState: (
    state: Partial<ClientState>
  ): UpdateClientStateAction => ({
    type: ACTION_UPDATE_CLIENT_STATE,
    payload: { state },
  }),
  updateCode: (diffs: Diff[], cursorOffset?: number): UpdateCodeAction => {
    const action = {
      type: ACTION_UPDATE_CODE,
      payload: { diffs },
    } as UpdateCodeAction;

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
