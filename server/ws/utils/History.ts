import { Diff } from '../interfaces/Diff';
import { getDiff } from './getDiff';

const HISTORY_SIZE_LIMIT = 50;

export class History {
  private index = -1;
  private readonly states = [] as HistoryState[];

  pushState(newState: HistoryState): void {
    const { index, states } = this;

    if (index < states.length - 1) {
      states.length = index + 1;
      states.push(newState);
      this.index = states.length - 1;
    } else {
      if (states.length >= HISTORY_SIZE_LIMIT) {
        states.splice(0, states.length - HISTORY_SIZE_LIMIT + 1);
      }

      if (states.length > 0) {
        const currentState = states[states.length - 1];
        const currentDiffObj = currentState.diffObj;
        const newDiffObj = getDiff(currentState.code, newState.code);

        newState.diffObj = newDiffObj;

        if (
          !/\s/.test(newState.diffObj.diff) &&
          currentDiffObj !== undefined &&
          newDiffObj.type === currentDiffObj.type &&
          newDiffObj.startOffset === currentDiffObj.endOffset
        ) {
          currentState.code = newState.code;
          currentState.cursorOffset = newState.cursorOffset;
          currentDiffObj.diff = `${currentDiffObj.diff}${newDiffObj.diff}`;
          currentDiffObj.endOffset = newDiffObj.endOffset;
          return;
        }
      }
      states.push(newState);
      this.index = states.length - 1;
    }
  }

  redo(applyState: ApplyStateFunction): void {
    const { index, states } = this;

    if (index < states.length - 1) {
      const newIndex = index + 1;
      this.index = newIndex;
      applyState(states[newIndex]);
    }
  }

  undo(applyState: ApplyStateFunction): void {
    const { index, states } = this;

    if (index > 0) {
      const newIndex = index - 1;
      this.index = newIndex;
      applyState(states[newIndex]);
    }
  }
}

type ApplyStateFunction = (state: HistoryState) => any;

export interface HistoryState {
  code: string;
  cursorOffset: number;
  diffObj?: Diff;
}
