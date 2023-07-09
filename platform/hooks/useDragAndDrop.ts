import type React from 'react';
import { MouseButton } from '../constants';
import type { EventHandler } from '../interfaces/EventHandler';
import { noop } from '../utils/noop';

type PointerMoveHandler = EventHandler<'pointermove'>;
type PointerUpHandler = EventHandler<'pointerup'>;

export function useDragAndDrop(
  downHandler: (downEvent: React.PointerEvent) => PointerMoveHandler | void,
  upHandler: PointerUpHandler = noop,
): (downEvent: React.PointerEvent) => void {
  return function dragAndDropHandler(downEvent: React.PointerEvent): void {
    if (downEvent.button !== MouseButton.Left) {
      return;
    }

    const moveHandler = downHandler(downEvent);

    // Handler could be canceled inside down handler
    if (moveHandler !== undefined) {
      downEvent.preventDefault();
      downEvent.persist();

      const hookUpHandler = (upEvent: PointerEvent) => {
        window.removeEventListener('pointermove', moveHandler);
        window.removeEventListener('pointerup', hookUpHandler);
        upHandler(upEvent);
      };

      window.addEventListener('pointermove', moveHandler);
      window.addEventListener('pointerup', hookUpHandler);
    }
  };
}
