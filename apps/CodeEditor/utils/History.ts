import type { EditableState } from '../interfaces/EditableState';
import type { Selection } from '../interfaces/Selection';
import { createSelection } from './createSelection';
import type { Diff } from './diffs';
import { applyDiff, getDiffs, revertDiff } from './diffs';
import { isIntoBrackets } from './isIntoBrackets';

const HISTORY_SIZE_LIMIT = 50;

export interface HistoryEntry {
  diffs: Diff[];
  selection: Selection;
}

export interface HistoryState {
  index: number;
  entries: HistoryEntry[];
}

export class History {
  constructor(
    public state: HistoryState = {
      index: -1,
      entries: [],
    },
  ) {}

  pushState(currentState: EditableState, newState: EditableState): void {
    const { entries, index } = this.state;
    const { code, selection } = currentState;
    const newDiffs = getDiffs(code, newState.code);
    const firstNewDiff = newDiffs[0];
    let lastStoredState: HistoryEntry;
    let lastStoredSelection: Selection;

    if (index < entries.length - 1) {
      entries.length = index + 1;
    } else {
      if (entries.length >= HISTORY_SIZE_LIMIT) {
        entries.splice(0, entries.length - HISTORY_SIZE_LIMIT + 1);
      }
      lastStoredState = entries[entries.length - 1];
      lastStoredSelection = lastStoredState?.selection ?? createSelection(0);

      if (
        entries.length > 0 &&
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

    lastStoredState = entries[entries.length - 1];
    lastStoredSelection = lastStoredState?.selection ?? createSelection(0);

    if (
      selection[0] !== lastStoredSelection[0] &&
      selection[1] !== lastStoredSelection[1]
    ) {
      entries.push({
        diffs: [],
        selection,
      });
    }

    entries.push({
      diffs: newDiffs,
      selection: newState.selection,
    });
    this.state.index = entries.length - 1;
  }

  redo(currentCode: string): EditableState | undefined {
    const { entries, index } = this.state;

    if (index < entries.length - 1) {
      const newIndex = index + 1;
      const { diffs, selection } = entries[newIndex];
      const newCode = diffs.reduce(applyDiff, currentCode);

      this.state.index = newIndex;

      return {
        code: newCode,
        selection,
      };
    }
  }

  undo(currentCode: string): EditableState | undefined {
    const { entries, index } = this.state;

    if (index > -1) {
      if (entries[index] === undefined) {
        console.debug({ entries, index, state: entries[index] });
        throw new Error('Inconsistent history state');
      }

      const newIndex = index - 1;
      const prevCode = entries[index].diffs.reduceRight(
        revertDiff,
        currentCode,
      );
      const prevSelection =
        newIndex >= 0 ? entries[newIndex].selection : createSelection(0);

      this.state.index = newIndex;

      return {
        code: prevCode,
        selection: prevSelection,
      };
    }
  }
}
