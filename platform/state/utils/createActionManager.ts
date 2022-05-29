import { Reducer } from 'react';
import { Action, ActionType } from '../interfaces/Action';
import { ActionManager } from '../interfaces/ActionManager';
import { createActionFactory } from './createActionFactory';

export function createActionManager<State, Payload = void>(
  type: ActionType,
  reduce: Reducer<State, Action<Payload>>
): ActionManager<State, Payload> {
  const actionFactory = createActionFactory<Payload>(type);

  return { ...actionFactory, reduce };
}
