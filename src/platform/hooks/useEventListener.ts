import { useEffect, useRef } from 'react';
import { EventHandler } from '../interfaces';
import { noop } from '../utils';

export function useEventListener<EventType extends keyof WindowEventMap>(
  eventType: EventType,
  handler: EventHandler<EventType>,
  active: boolean = true
): void {
  const handlerRef = useRef<EventHandler<EventType>>(noop);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (active) {
      const listener: EventHandler<EventType> = event => {
        handlerRef.current(event);
      };
      window.addEventListener(eventType, listener);

      return () => window.removeEventListener(eventType, listener);
    }
  }, [active, eventType]);
}
