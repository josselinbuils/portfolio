import { MouseButton } from '../constants';
import { type EventHandler } from '../interfaces/EventHandler';
import { noop } from '../utils/noop';

export function useDragAndDrop(
  downHandler: (downEvent: PointerEvent) => EventHandler<'pointermove'> | void,
  upHandler: EventHandler<'pointerup'> = noop,
): (downEvent: PointerEvent) => void {
  return function dragAndDropHandler(downEvent: PointerEvent): void {
    if (downEvent.button !== MouseButton.Left) {
      return;
    }

    const moveHandler = downHandler(downEvent);

    // Handler could be canceled inside down handler
    if (moveHandler !== undefined) {
      downEvent.preventDefault();

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
