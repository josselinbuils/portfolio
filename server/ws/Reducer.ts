import fs from 'fs';
import { Action } from 'redux';
import { ClientState } from './ClientState';
import { STATE_PATH } from './constants';
import { ExecQueue } from './ExecQueue';
import { spliceString } from './spliceString';

const ACTION_UPDATE_SHARED_STATE = 'UPDATE_SHARED_STATE';

export class Reducer {
  private readonly execQueue = new ExecQueue();

  constructor() {
    this.reduce = this.reduce.bind(this);
  }

  reduce(currentState: ClientState, action: Action): ClientState {
    if (action.type === ACTION_UPDATE_SHARED_STATE) {
      const { diffObj } = (action as UpdateSharedStateAction).payload;
      const newState = {
        ...currentState,
        code:
          diffObj.type === '+'
            ? spliceString(
                currentState.code,
                diffObj.startOffset,
                0,
                diffObj.diff
              )
            : spliceString(
                currentState.code,
                diffObj.endOffset,
                diffObj.diff.length
              ),
      };

      // Avoids race conditions
      this.execQueue.enqueue(
        async () =>
          new Promise<void>((resolve) => {
            fs.writeFile(STATE_PATH, newState.code, resolve as () => void);
          })
      );

      return newState;
    }
    return currentState;
  }
}

interface Diff {
  endOffset: number;
  diff: string;
  startOffset: number;
  type: '+' | '-';
}

interface UpdateSharedStateAction extends Action {
  payload: {
    cursorOffset: number;
    diffObj: Diff;
  };
}
