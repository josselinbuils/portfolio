import { Action, Reducer } from 'redux';
import { Diff } from '../../interfaces';
import { spliceString } from '../../utils';
import { ClientState } from './ClientState';

const ACTION_SET_STATE = 'SET_STATE';
const ACTION_UPDATE_SHARED_STATE = 'UPDATE_SHARED_STATE';

export const actionCreators = {
  updateClientState: (
    diffObj: Diff,
    cursorOffset: number
  ): UpdateSharedStateAction => ({
    type: ACTION_UPDATE_SHARED_STATE,
    payload: {
      cursorOffset,
      diffObj,
    },
  }),
};

export const actionsHandlers = {
  [ACTION_SET_STATE]: (state: ClientState, action) =>
    (action as SetSharedStateAction).payload.state,
  [ACTION_UPDATE_SHARED_STATE]: (state: ClientState, action) => {
    const {
      cursorOffset,
      diffObj,
    } = (action as UpdateSharedStateAction).payload;

    return {
      ...state,
      code:
        diffObj.type === '+'
          ? spliceString(state.code, diffObj.startOffset, 0, diffObj.diff)
          : spliceString(state.code, diffObj.endOffset, diffObj.diff.length),
      cursorOffset,
    };
  },
} as { [action: string]: Reducer<ClientState> };

interface SetSharedStateAction extends Action {
  payload: { state: ClientState };
}

interface UpdateSharedStateAction extends Action {
  payload: {
    cursorOffset: number;
    diffObj: Diff;
  };
}
