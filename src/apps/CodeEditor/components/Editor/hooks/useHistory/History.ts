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

    if (index < states.length - 1) {
      states.length = index + 1;
      states.push({
        cursorOffset: newState.cursorOffset,
        diffs: newDiffs,
      });
      this.index = states.length - 1;
    } else {
      if (states.length >= HISTORY_SIZE_LIMIT) {
        states.splice(0, states.length - HISTORY_SIZE_LIMIT + 1);
      }

      if (states.length > 0) {
        const currentState = states[states.length - 1];
        const currentDiffs = currentState.diffs;
        const lastCurrentDiff = currentDiffs[currentDiffs.length - 1] as Diff;

        if (newDiffs.length === 1) {
          const newDiff = newDiffs[0];

          if (
            !/\s/.test(newDiff[2]) &&
            newDiff[0] === lastCurrentDiff[0] &&
            getCursorOffsetBeforeDiff(newDiff) ===
              getCursorOffsetAfterDiff(lastCurrentDiff)
          ) {
            currentState.cursorOffset = newState.cursorOffset;
            currentDiffs.push(newDiff);
            return;
          }
        }
      }
      states.push({
        cursorOffset: newState.cursorOffset,
        diffs: newDiffs,
      });
      this.index = states.length - 1;
    }
  }

  redo(currentCode: string): EditableState | undefined {
    const { index, states } = this;

    if (index < states.length - 1) {
      const newIndex = index + 1;
      const { cursorOffset, diffs } = states[newIndex];
      const newCode = diffs.reduce(applyDiff, currentCode);

      this.index = newIndex;

      return { code: newCode, cursorOffset };
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
        cursorOffset: prevCursorOffset,
      };
    }
  }
}

export interface HistoryState {
  cursorOffset: number;
  diffs: Diff[];
}
