import { useEffect, useRef } from 'react';
import { EventHandler } from '~/platform/interfaces';
import { noop } from '~/platform/utils';

export function useEventListener<EventType extends keyof WindowEventMap>(
  event: EventType,
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
      window.addEventListener(event, listener);

      return () => window.removeEventListener(event, listener);
    }
  }, [active, event]);
}
