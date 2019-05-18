import React, { useRef } from 'react';
import { MouseButton } from '~/platform/constants';
import { EventHandler } from '~/platform/interfaces';
import { noop } from '~/platform/utils';
import { useEventListener } from './useEventListener';

// TODO remove global event listeners
export function useDragAndDrop(
  downHandler: (downEvent: MouseEvent) => MouseMoveHandler | void,
  upHandler: MouseUpHandler
): (downEvent: React.MouseEvent) => void {
  const moveHandlerRef = useRef<MouseMoveHandler>(noop);
  const upHandlerRef = useRef<MouseUpHandler>(noop);

  useEventListener('mousemove', (moveEvent: MouseEvent) =>
    requestAnimationFrame(() => moveHandlerRef.current(moveEvent))
  );

  useEventListener('mouseup', (upEvent: MouseEvent) =>
    upHandlerRef.current(upEvent)
  );

  return function dragAndDropHandler(downEvent: React.MouseEvent) {
    if (downEvent.button !== MouseButton.Left) {
      return;
    }

    const moveHandler = downHandler(downEvent.nativeEvent);

    // Handler could be canceled inside down handler
    if (moveHandler !== undefined) {
      downEvent.preventDefault();
      downEvent.persist();

      moveHandlerRef.current = moveHandler;

      upHandlerRef.current = (upEvent: MouseEvent) => {
        upHandler(upEvent);
        moveHandlerRef.current = noop;
        upHandlerRef.current = noop;
      };
    }
  };
}

type MouseMoveHandler = EventHandler<'mousemove'>;
type MouseUpHandler = EventHandler<'mouseup'>;
