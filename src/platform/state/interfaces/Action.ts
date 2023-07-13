export type Action<Payload = void> = Payload extends void
  ? [type: string]
  : [type: string, payload: Payload];
