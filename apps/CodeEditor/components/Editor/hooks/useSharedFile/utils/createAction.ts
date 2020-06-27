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
} from '~/apps/CodeEditor/interfaces/actions';
import { ClientState } from '~/apps/CodeEditor/interfaces/ClientState';
import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { Diff } from '~/apps/CodeEditor/utils/diffs';

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
    currentSelection: Selection,
    diffs: Diff[],
    newSelection: Selection,
    safetyHash: number
  ): UpdateCodeAction => ({
    type: ACTION_UPDATE_CODE,
    payload: {
      currentSelection,
      diffs,
      newSelection,
      safetyHash,
    },
  }),
  updateSelection: (selection: Selection): UpdateSelectionAction => ({
    type: ACTION_UPDATE_SELECTION,
    payload: { selection },
  }),
};
