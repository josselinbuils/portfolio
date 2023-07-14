import { useEffect } from 'preact/compat';
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

      const eventKeyStr = getEventKeyStr(event);

      for (const [keyStr, handler] of Object.entries(keyMap)) {
        const isTarget =
          keyStr === '*' ||
          keyStr.split(',').some((subKeyStr) => subKeyStr === eventKeyStr);

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

function getEventKeyStr({
  altKey,
  ctrlKey,
  key,
  metaKey,
  shiftKey,
}: KeyboardEvent): string {
  let eventKeyStr = altKey && key !== 'Alt' ? 'Alt+' : '';

  eventKeyStr += ctrlKey && key !== 'Control' ? 'Control+' : '';
  eventKeyStr += metaKey && key !== 'Meta' ? 'Meta+' : '';
  eventKeyStr += shiftKey && key !== 'Shift' ? 'Shift+' : '';
  eventKeyStr += key.length === 1 ? key.toUpperCase() : key;

  return eventKeyStr;
}
