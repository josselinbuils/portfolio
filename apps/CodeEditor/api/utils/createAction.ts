import {
  ACTION_UPDATE_CLIENT_STATE,
  ACTION_UPDATE_CODE,
  ACTION_UPDATE_CURSORS,
  ACTION_UPDATE_SELECTION,
  UpdateClientStateAction,
  UpdateCodeAction,
  UpdateCursorsAction,
  UpdateSelectionAction,
} from '../../components/Editor/hooks/useSharedFile/interfaces/actions';
import { ClientCursor } from '../../components/Editor/hooks/useSharedFile/interfaces/ClientCursor';
import { ClientState } from '../../components/Editor/hooks/useSharedFile/interfaces/ClientState';
import { Selection } from '../../components/Editor/interfaces/Selection';
import { Diff } from '../../components/Editor/utils/diffs';

export const createAction = {
  updateClientState: (
    state: Partial<ClientState>
  ): UpdateClientStateAction => ({
    type: ACTION_UPDATE_CLIENT_STATE,
    payload: { state },
  }),
  updateCode: (diffs: Diff[], selection?: Selection): UpdateCodeAction => {
    const action = {
      type: ACTION_UPDATE_CODE,
      payload: { diffs },
    } as UpdateCodeAction;

    if (selection !== undefined) {
      action.payload.selection = selection;
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
