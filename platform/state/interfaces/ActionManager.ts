import { Reducer } from 'react';
import { Action } from './Action';
import { ActionFactory } from './ActionFactory';

export interface ActionManager<State, Payload> extends ActionFactory<Payload> {
  reduce: Reducer<State, Action<Payload>>;
}
