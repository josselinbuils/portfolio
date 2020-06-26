import { EditableState } from '../../interfaces/EditableState';
import { isIntoBrackets } from '../../utils/autoEditChange/utils/isIntoBrackets';
import { applyDiff, Diff, getDiffs, revertDiff } from '../../utils/diffs';

const HISTORY_SIZE_LIMIT = 50;

// TODO manage selections

export class History {
  private index = -1;
  private readonly states = [] as HistoryState[];

  pushState(
    currentCode: string,
    cursorOffset: number,
    newState: EditableState
  ): void {
    const { index, states } = this;
    const newDiffs = getDiffs(currentCode, newState.code);
    const firstNewDiff = newDiffs[0];
    let currentState: HistoryState;
    let lastStoredCursorOffset: number;

    if (index < states.length - 1) {
      states.length = index + 1;
    } else {
      if (states.length >= HISTORY_SIZE_LIMIT) {
        states.splice(0, states.length - HISTORY_SIZE_LIMIT + 1);
      }
      currentState = states[states.length - 1];
      lastStoredCursorOffset = currentState?.cursorOffset ?? 0;

      if (
        states.length > 0 &&
        newDiffs.length === 1 &&
        currentState.diffs.length > 0
      ) {
        const currentDiffs = currentState.diffs;
        const lastCurrentDiff = currentDiffs[currentDiffs.length - 1];

        if (
          !/\s/.test(firstNewDiff[2]) &&
          firstNewDiff[0] === lastCurrentDiff[0] &&
          cursorOffset === lastStoredCursorOffset &&
          !isIntoBrackets(currentCode, cursorOffset)
        ) {
          currentState.cursorOffset = newState.selection.start;
          currentDiffs.push(firstNewDiff);
          return;
        }
      }
    }

    currentState = states[states.length - 1];
    lastStoredCursorOffset = currentState?.cursorOffset ?? 0;

    if (newDiffs.length === 1 && cursorOffset !== lastStoredCursorOffset) {
      states.push({
        cursorOffset,
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
        selection: {
          start: cursorOffset,
          end: cursorOffset,
        },
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
        selection: {
          start: prevCursorOffset,
          end: prevCursorOffset,
        },
      };
    }
  }
}

export interface HistoryState {
  cursorOffset: number;
  diffs: Diff[];
}
