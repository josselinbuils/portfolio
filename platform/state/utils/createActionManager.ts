import type { Reducer } from 'react';
import type { Action } from '../interfaces/Action';
import type { ActionManager } from '../interfaces/ActionManager';
import { createActionFactory } from './createActionFactory';

export function createActionManager<State, Payload = void>(
  type: string,
  reduce: Reducer<State, Action<Payload>>
): ActionManager<State, Payload> {
  const actionFactory = createActionFactory<Payload>(type);

  return { ...actionFactory, reduce };
}
