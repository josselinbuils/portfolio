import { type Reducer } from 'preact/compat';
import { type Action } from './Action';
import { type ActionFactory } from './ActionFactory';

export interface ActionManager<State, Payload> extends ActionFactory<Payload> {
  reduce: Reducer<State, Action<Payload>>;
}
