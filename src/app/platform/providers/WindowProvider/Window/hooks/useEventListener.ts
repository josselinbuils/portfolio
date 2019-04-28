import { useCallback, useEffect, useMemo } from 'react';

export function useEventListener(): <EventType extends keyof WindowEventMap>(
  event: EventType,
  handler: EventHandler<EventType>,
  target?: ListenerTarget
) => () => void {
  const listeners: EventListener<any>[] = useMemo(() => [], []);

  useEffect(
    () => () => {
      listeners.forEach(({ event, handler, target }) => {
        target.removeEventListener(event, handler);
      });
    },
    [listeners]
  );

  return useCallback(
    (event, handler, target = window) => {
      const listener = { event, handler, target };

      listeners.push(listener);
      target.addEventListener(event, handler);

      return () => {
        target.removeEventListener(event, handler);

        const index = listeners.indexOf(listener);

        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    [listeners]
  );
}

type EventHandler<EventType extends keyof WindowEventMap> = (
  event: WindowEventMap[EventType]
) => void;
type ListenerTarget = Window | HTMLElement;

interface EventListener<EventType extends keyof WindowEventMap> {
  event: EventType;
  handler: EventHandler<EventType>;
  target: ListenerTarget;
}
