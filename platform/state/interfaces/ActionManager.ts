import { Reducer } from 'react';
import { ActionFactory } from './ActionFactory';
import { Action } from './Action';

export interface ActionManager<State, Payload> extends ActionFactory<Payload> {
  reduce: Reducer<State, Action<Payload>>;
}
