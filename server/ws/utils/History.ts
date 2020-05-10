import {
  Diff,
  getCursorOffsetAfterDiff,
  getCursorOffsetBeforeDiff,
  getDiffs,
  getDiffType,
} from './diffs';

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
        const currentDiff = currentState.diff;
        const newDiffs = getDiffs(currentState.code, newState.code);

        if (newDiffs.length === 1) {
          const newDiff = newDiffs[0];
          newState.diff = newDiff;

          if (
            !/\s/.test(newDiff[2]) &&
            currentDiff !== undefined &&
            getDiffType(newDiff) === getDiffType(currentDiff) &&
            getCursorOffsetBeforeDiff(newDiff) ===
              getCursorOffsetAfterDiff(currentDiff)
          ) {
            currentState.code = newState.code;
            currentState.cursorOffset = newState.cursorOffset;
            currentDiff[1] += newDiff[1];
            currentDiff[2] = `${currentDiff[2]}${newDiff[2]}`;
            return;
          }
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
  diff?: Diff;
}
