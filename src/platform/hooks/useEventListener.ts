import { useEffect } from 'preact/compat';
import { useDynamicRef } from './useDynamicRef';

/**
 * Allows listening window events with automatic cleaning.
 */
export function useEventListener<EventType extends keyof WindowEventMap>(
  eventType: EventType,
  handler: (event: WindowEventMap[EventType]) => void,
  active = true,
): void {
  const handlerRef = useDynamicRef(handler);

  useEffect(() => {
    if (active) {
      const listener = (event: WindowEventMap[EventType]) => {
        handlerRef.current(event);
      };
      window.addEventListener(eventType, listener);

      return () => window.removeEventListener(eventType, listener);
    }
  }, [active, eventType, handlerRef]);
}
