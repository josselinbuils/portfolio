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
  redo: (): RedoAction => [ACTION_REDO],
  undo: (): UndoAction => [ACTION_UNDO],
  updateClientState: (state: Partial<ClientState>): UpdateClientStateAction => [
    ACTION_UPDATE_CLIENT_STATE,
    { s: state },
  ],
  updateCode: (
    currentSelection: Selection,
    diffs: Diff[],
    newSelection: Selection,
    safetyHash: number
  ): UpdateCodeAction => [
    ACTION_UPDATE_CODE,
    {
      cs: currentSelection,
      d: diffs,
      ns: newSelection,
      sh: safetyHash,
    },
  ],
  updateSelection: (selection: Selection): UpdateSelectionAction => [
    ACTION_UPDATE_SELECTION,
    { s: selection },
  ],
};
