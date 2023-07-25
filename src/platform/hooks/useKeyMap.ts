import { useEffect } from 'preact/compat';
import { getKeyFromEvent, normaliseKeys } from '../utils/keys';
import { useEventListener } from './useEventListener';

const priorities = [] as number[];

/**
 * Allows listening keyboard events.
 */
export function useKeyMap(
  keyMap: {
    [keyStr: string]: (event: KeyboardEvent) => false | any;
  },
  active = true,
  priority = 1,
): void {
  useEffect(() => {
    if (active) {
      priorities.push(priority);
    }
    return () => {
      priorities.splice(priorities.indexOf(priority));
    };
  }, [active, priority]);

  useEventListener(
    'keydown',
    (event) => {
      if (Math.max(...priorities) > priority) {
        return;
      }

      const eventKeyStr = getKeyFromEvent(event);

      for (const [keyStr, handler] of Object.entries(keyMap)) {
        const isTarget =
          keyStr === '*' ||
          normaliseKeys(keyStr)
            .split(',')
            .some((subKeyStr) => subKeyStr === eventKeyStr);

        if (isTarget) {
          if (handler(event) !== false) {
            event.preventDefault();
          }
          break;
        }
      }
    },
    active,
  );
}
