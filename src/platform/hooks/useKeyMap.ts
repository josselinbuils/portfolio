import { useEventListener } from './useEventListener';

export function useKeyMap(
  keyMap: { [keyStr: string]: () => void },
  active: boolean
): void {
  useEventListener(
    'keydown',
    (event) => {
      for (const [keyStr, handler] of Object.entries(keyMap)) {
        const isTarget = keyStr.split('+').every((key, index, keys) => {
          const isLastKey = index === keys.length - 1;

          if (isLastKey) {
            return key === event.key;
          }

          switch (key) {
            case 'alt':
              return event.altKey;

            case 'ctrl':
              return event.ctrlKey || event.metaKey;

            case 'shift':
              return event.shiftKey;

            default:
              return false;
          }
        });

        if (isTarget) {
          event.preventDefault();
          handler();
          break;
        }
      }
    },
    active
  );
}
