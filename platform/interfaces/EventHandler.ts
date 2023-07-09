export type EventHandler<EventType extends keyof WindowEventMap> = (
  event: WindowEventMap[EventType],
) => void;
