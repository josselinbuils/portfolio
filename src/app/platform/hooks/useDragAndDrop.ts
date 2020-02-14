import React from 'react';
import { MouseButton } from '~/platform/constants';
import { EventHandler } from '~/platform/interfaces';
import { noop } from '~/platform/utils';

export function useDragAndDrop(
  downHandler: (downEvent: React.MouseEvent) => MouseMoveHandler | void,
  upHandler: MouseUpHandler = noop
): (downEvent: React.MouseEvent) => void {
  return function dragAndDropHandler(downEvent: React.MouseEvent): void {
    if (downEvent.button !== MouseButton.Left) {
      return;
    }

    const moveHandler = downHandler(downEvent);

    // Handler could be canceled inside down handler
    if (moveHandler !== undefined) {
      downEvent.preventDefault();
      downEvent.persist();

      const hookUpHandler = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', hookUpHandler);
        upHandler(upEvent);
      };

      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', hookUpHandler);
    }
  };
}

type MouseMoveHandler = EventHandler<'mousemove'>;
type MouseUpHandler = EventHandler<'mouseup'>;
