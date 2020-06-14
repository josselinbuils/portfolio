import { Diff } from '../../../utils/diffs';
import {
  ACTION_REDO,
  ACTION_UNDO,
  ACTION_UPDATE_CLIENT_STATE,
  ACTION_UPDATE_CODE,
  ACTION_UPDATE_CURSOR_OFFSET,
  RedoAction,
  UndoAction,
  UpdateClientStateAction,
  UpdateCodeAction,
  UpdateCursorOffsetAction,
} from '../interfaces/actions';
import { ClientState } from '../interfaces/ClientState';

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
    diffs: Diff[],
    cursorOffset: number,
    safetyHash: number
  ): UpdateCodeAction => ({
    type: ACTION_UPDATE_CODE,
    payload: {
      cursorOffset,
      diffs,
      safetyHash,
    },
  }),
  updateCursorOffset: (cursorOffset: number): UpdateCursorOffsetAction => ({
    type: ACTION_UPDATE_CURSOR_OFFSET,
    payload: { cursorOffset },
  }),
};
