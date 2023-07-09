import type { Reducer } from 'react';
import type { Action } from '../interfaces/Action';
import type { ActionManager } from '../interfaces/ActionManager';

export function createReducer<State>(
  actionManagers: ActionManager<State, any>[],
): Reducer<State, Action<any>> {
  const reducers = Object.fromEntries(
    actionManagers
      .filter(({ reduce }) => reduce !== undefined)
      .map(({ reduce, type }) => [type, reduce]),
  );
  return (state, action) => reducers[action[0]]?.(state, action) ?? state;
}
