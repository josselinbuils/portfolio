export type ActionType = number | string;

export type Action<Payload = void> = Payload extends void
  ? [type: ActionType]
  : [type: ActionType, payload: Payload];
