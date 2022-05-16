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
  updateClientState: (state: Partial<ClientState>): UpdateClientStateAction => [
    ACTION_UPDATE_CLIENT_STATE,
    { s: state },
  ],
  updateCode: (diffs: Diff[], newSelection?: Selection): UpdateCodeAction => {
    const action: UpdateCodeAction = [ACTION_UPDATE_CODE, { d: diffs }];

    if (newSelection !== undefined) {
      action[1].ns = newSelection;
    }
    return action;
  },
  updateCursors: (cursors: ClientCursor[]): UpdateCursorsAction => [
    ACTION_UPDATE_CURSORS,
    { c: cursors },
  ],
  updateSelection: (
    clientID: number,
    selection: Selection
  ): UpdateSelectionAction => [
    ACTION_UPDATE_SELECTION,
    { cid: clientID, s: selection },
  ],
};
