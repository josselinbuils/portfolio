import { Selection } from '../../../interfaces/Selection';
import { Diff } from '../../../utils/diffs';
import {
  ACTION_REDO,
  ACTION_UNDO,
  ACTION_UPDATE_CLIENT_STATE,
  ACTION_UPDATE_CODE,
  ACTION_UPDATE_SELECTION,
  RedoAction,
  UndoAction,
  UpdateClientStateAction,
  UpdateCodeAction,
  UpdateSelectionAction,
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
    selection: Selection,
    safetyHash: number
  ): UpdateCodeAction => ({
    type: ACTION_UPDATE_CODE,
    payload: {
      diffs,
      safetyHash,
      selection,
    },
  }),
  updateSelection: (selection: Selection): UpdateSelectionAction => ({
    type: ACTION_UPDATE_SELECTION,
    payload: { selection },
  }),
};
