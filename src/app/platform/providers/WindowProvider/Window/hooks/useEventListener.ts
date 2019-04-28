import { useCallback, useEffect, useMemo } from 'react';

export function useEventListener() {
  const listeners: any[] = useMemo(() => [], []);

  useEffect(
    () => () => {
      listeners.forEach(({ element, event, listener }) => {
        element.removeEventListener(event, listener);
      });
    },
    [listeners]
  );

  return useCallback(
    <EventType extends keyof WindowEventMap>(
      element: Window | HTMLElement,
      event: EventType,
      listener: (event: WindowEventMap[EventType]) => void
    ) => {
      const entry = { element, event, listener };

      listeners.push(entry);
      element.addEventListener(event, listener);

      return () => {
        element.removeEventListener(event, listener);

        const index = listeners.indexOf(entry);

        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    [listeners]
  );
}
