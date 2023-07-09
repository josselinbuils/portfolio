import { type Reducer } from 'react';
import { type Action } from './Action';
import { type ActionFactory } from './ActionFactory';

export interface ActionManager<State, Payload> extends ActionFactory<Payload> {
  reduce: Reducer<State, Action<Payload>>;
}
