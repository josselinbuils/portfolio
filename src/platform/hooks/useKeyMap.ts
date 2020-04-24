import { useEventListener } from './useEventListener';

export function useKeyMap(
  keyMap: {
    [keyStr: string]: (
      event: KeyboardEvent
    ) => void | false | Promise<void | false>;
  },
  active: boolean = true
): void {
  useEventListener(
    'keydown',
    async (event) => {
      const eventKeyStr = getEventKeyStr(event);

      for (const [keyStr, handler] of Object.entries(keyMap)) {
        const isTarget =
          keyStr === '*' ||
          keyStr.split(',').some((subKeyStr) => subKeyStr === eventKeyStr);

        if (isTarget) {
          if ((await handler(event)) !== false) {
            event.preventDefault();
          }
          break;
        }
      }
    },
    active
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
