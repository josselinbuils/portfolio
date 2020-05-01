import { useEffect } from 'react';
import { EventHandler } from '../interfaces';
import { useDynamicRef } from './useDynamicRef';

export function useEventListener<EventType extends keyof WindowEventMap>(
  eventType: EventType,
  handler: EventHandler<EventType>,
  active: boolean = true
): void {
  const handlerRef = useDynamicRef(handler);

  useEffect(() => {
    if (active) {
      const listener: EventHandler<EventType> = (event) => {
        handlerRef.current(event);
      };
      window.addEventListener(eventType, listener);

      return () => window.removeEventListener(eventType, listener);
    }
  }, [active, eventType, handlerRef]);
}
