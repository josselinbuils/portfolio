import { Reducer } from 'react';
import { Action } from '../interfaces/Action';
import { ActionManager } from '../interfaces/ActionManager';
import { createActionFactory } from './createActionFactory';

export function createActionManager<State, Payload = void>(
  type: string,
  reduce: Reducer<State, Action<Payload>>
): ActionManager<State, Payload> {
  const actionFactory = createActionFactory<Payload>(type);

  return { ...actionFactory, reduce };
}
