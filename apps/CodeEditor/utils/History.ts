import { EditableState } from '../interfaces/EditableState';
import { Selection } from '../interfaces/Selection';
import { createSelection } from './createSelection';
import { applyDiff, Diff, getDiffs, revertDiff } from './diffs';
import { isIntoBrackets } from './isIntoBrackets';

const HISTORY_SIZE_LIMIT = 50;

export class History {
  private index = -1;
  private readonly states = [] as HistoryState[];

  pushState(currentState: EditableState, newState: EditableState): void {
    const { index, states } = this;
    const { code, selection } = currentState;
    const newDiffs = getDiffs(code, newState.code);
    const firstNewDiff = newDiffs[0];
    let lastStoredState: HistoryState;
    let lastStoredSelection: Selection;

    if (index < states.length - 1) {
      states.length = index + 1;
    } else {
      if (states.length >= HISTORY_SIZE_LIMIT) {
        states.splice(0, states.length - HISTORY_SIZE_LIMIT + 1);
      }
      lastStoredState = states[states.length - 1];
      lastStoredSelection = lastStoredState?.selection ?? createSelection(0);

      if (
        states.length > 0 &&
        newDiffs.length === 1 &&
        lastStoredState.diffs.length > 0
      ) {
        const currentDiffs = lastStoredState.diffs;
        const lastCurrentDiff = currentDiffs[currentDiffs.length - 1];

        if (
          !/\s/.test(firstNewDiff[2]) &&
          firstNewDiff[0] === lastCurrentDiff[0] &&
          selection[0] === lastStoredSelection[0] &&
          selection[1] === lastStoredSelection[1] &&
          selection[1] === selection[0] &&
          !isIntoBrackets(code, selection[0])
        ) {
          lastStoredState.selection = newState.selection;
          currentDiffs.push(firstNewDiff);
          return;
        }
      }
    }

    lastStoredState = states[states.length - 1];
    lastStoredSelection = lastStoredState?.selection ?? createSelection(0);

    if (
      selection[0] !== lastStoredSelection[0] &&
      selection[1] !== lastStoredSelection[1]
    ) {
      states.push({
        diffs: [],
        selection,
      });
    }

    states.push({
      diffs: newDiffs,
      selection: newState.selection,
    });
    this.index = states.length - 1;
  }

  redo(currentCode: string): EditableState | undefined {
    const { index, states } = this;

    if (index < states.length - 1) {
      const newIndex = index + 1;
      const { diffs, selection } = states[newIndex];
      const newCode = diffs.reduce(applyDiff, currentCode);

      this.index = newIndex;

      return {
        code: newCode,
        selection,
      };
    }
  }

  undo(currentCode: string): EditableState | undefined {
    const { index, states } = this;

    if (index > -1) {
      const newIndex = index - 1;
      const prevCode = states[index].diffs.reduceRight(revertDiff, currentCode);
      const prevSelection =
        newIndex >= 0 ? states[newIndex].selection : createSelection(0);

      this.index = newIndex;

      return {
        code: prevCode,
        selection: prevSelection,
      };
    }
  }
}

export interface HistoryState {
  diffs: Diff[];
  selection: Selection;
}
