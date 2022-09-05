import { Action } from './Action';

export type ActionCreator<Payload = void> = Payload extends void
  ? () => Action<Payload>
  : (payload: Payload) => Action<Payload>;

export interface ActionFactory<Payload> {
  create: ActionCreator<Payload>;
  type: string;
}

export type ActionFromFactory<Factory> = Factory extends ActionFactory<
  infer Payload
>
  ? Action<Payload>
  : Action;
