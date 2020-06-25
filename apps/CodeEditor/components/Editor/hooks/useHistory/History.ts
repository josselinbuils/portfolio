import { EditableState } from '../../interfaces/EditableState';
import {
  applyDiff,
  Diff,
  getCursorOffsetAfterDiff,
  getCursorOffsetBeforeDiff,
  getDiffs,
  revertDiff,
} from '../../utils/diffs';

const HISTORY_SIZE_LIMIT = 50;

export class History {
  private index = -1;
  private readonly states = [] as HistoryState[];

  pushState(currentCode: string, newState: EditableState): void {
    const { index, states } = this;
    const newDiffs = getDiffs(currentCode, newState.code);
    const firstNewDiff = newDiffs[0];
    const cursorOffsetBeforeDiff = getCursorOffsetBeforeDiff(firstNewDiff);
    const currentState = states[states.length - 1];
    let lastStoredCursorOffset = 0;

    if (currentState !== undefined) {
      const currentDiffs = currentState.diffs;
      const lastCurrentDiff = currentDiffs[currentDiffs.length - 1] as Diff;
      lastStoredCursorOffset = getCursorOffsetAfterDiff(lastCurrentDiff);
    }

    if (index < states.length - 1) {
      states.length = index + 1;
    } else {
      if (states.length >= HISTORY_SIZE_LIMIT) {
        states.splice(0, states.length - HISTORY_SIZE_LIMIT + 1);
      }

      if (states.length > 0) {
        const currentDiffs = currentState.diffs;
        const lastCurrentDiff = currentDiffs[currentDiffs.length - 1] as Diff;

        if (
          newDiffs.length === 1 &&
          !/\s/.test(firstNewDiff[2]) &&
          firstNewDiff[0] === lastCurrentDiff[0] &&
          cursorOffsetBeforeDiff === lastStoredCursorOffset
        ) {
          currentState.cursorOffset = newState.selection.start;
          currentDiffs.push(firstNewDiff);
          return;
        }
      }
    }

    if (cursorOffsetBeforeDiff !== lastStoredCursorOffset) {
      states.push({
        cursorOffset: cursorOffsetBeforeDiff,
        diffs: [],
      });
    }

    states.push({
      cursorOffset: newState.selection.start,
      diffs: newDiffs,
    });
    this.index = states.length - 1;
  }

  redo(currentCode: string): EditableState | undefined {
    const { index, states } = this;

    if (index < states.length - 1) {
      const newIndex = index + 1;
      const { cursorOffset, diffs } = states[newIndex];
      const newCode = diffs.reduce(applyDiff, currentCode);

      this.index = newIndex;

      return {
        code: newCode,
        selection: { end: cursorOffset, start: cursorOffset },
      };
    }
  }

  undo(currentCode: string): EditableState | undefined {
    const { index, states } = this;

    if (index > -1) {
      const newIndex = index - 1;
      const prevCode = states[index].diffs.reduceRight(revertDiff, currentCode);
      const prevCursorOffset =
        newIndex >= 0 ? states[newIndex].cursorOffset : 0;

      this.index = newIndex;

      return {
        code: prevCode,
        selection: { end: prevCursorOffset, start: prevCursorOffset },
      };
    }
  }
}

export interface HistoryState {
  cursorOffset: number;
  diffs: Diff[];
}
