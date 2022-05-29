import { Reducer } from 'react';
import { Action } from '../interfaces/Action';
import { ActionManager } from '../interfaces/ActionManager';

export function createReducer<State>(
  actionManagers: ActionManager<State, any>[]
): Reducer<State, Action<any>> {
  const reducers = Object.fromEntries(
    actionManagers
      .filter(({ reduce }) => reduce !== undefined)
      .map(({ reduce, type }) => [type, reduce])
  );
  return (state, action) => reducers[action[0]]?.(state, action) ?? state;
}
