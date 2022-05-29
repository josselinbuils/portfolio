import { ActionType } from '../interfaces/Action';
import { ActionCreator, ActionFactory } from '../interfaces/ActionFactory';

const isProduction = process.env.NODE_ENV === 'production';
let prodActionId = -1; // To reduce size of WebSocket payloads

export function createActionFactory<Payload = void>(
  type: ActionType
): ActionFactory<Payload> {
  const optimisedType = isProduction ? ++prodActionId : type;

  return {
    create: ((payload?: unknown) =>
      payload !== undefined
        ? [type, payload]
        : [type]) as ActionCreator<Payload>,
    type: optimisedType,
  };
}
