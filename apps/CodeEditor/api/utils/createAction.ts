import {
  ACTION_UPDATE_CLIENT_STATE,
  ACTION_UPDATE_CODE,
  ACTION_UPDATE_CURSORS,
  ACTION_UPDATE_SELECTION,
  UpdateClientStateAction,
  UpdateCodeAction,
  UpdateCursorsAction,
  UpdateSelectionAction,
} from '../../interfaces/actions';
import { ClientCursor } from '../../interfaces/ClientCursor';
import { ClientState } from '../../interfaces/ClientState';
import { Selection } from '../../interfaces/Selection';
import { Diff } from '../../utils/diffs';

export const createAction = {
  updateClientState: (
    state: Partial<ClientState>
  ): UpdateClientStateAction => ({
    type: ACTION_UPDATE_CLIENT_STATE,
    payload: { state },
  }),
  updateCode: (diffs: Diff[], newSelection?: Selection): UpdateCodeAction => {
    const action: UpdateCodeAction = {
      type: ACTION_UPDATE_CODE,
      payload: { diffs },
    };

    if (newSelection !== undefined) {
      action.payload.newSelection = newSelection;
    }
    return action;
  },
  updateCursors: (cursors: ClientCursor[]): UpdateCursorsAction => ({
    type: ACTION_UPDATE_CURSORS,
    payload: { cursors },
  }),
  updateSelection: (
    clientID: number,
    selection: Selection
  ): UpdateSelectionAction => ({
    type: ACTION_UPDATE_SELECTION,
    payload: { clientID, selection },
  }),
};
