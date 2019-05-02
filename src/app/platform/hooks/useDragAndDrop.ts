import React, { useCallback, useRef } from 'react';
import { MouseButton } from '~/platform/constants';
import { EventHandler } from '~/platform/interfaces';
import { noop } from '~/platform/utils';
import { useEventListener } from './useEventListener';

export function useDragAndDrop(): (
  downHandler: (downEvent: MouseEvent) => EventHandler<'mousemove'> | void,
  upHandler: EventHandler<'mouseup'>
) => (downEvent: React.MouseEvent) => void {
  const moveHandlerRef = useRef<EventHandler<'mousemove'>>(noop);
  const upHandlerRef = useRef<EventHandler<'mousemove'>>(noop);

  useEventListener('mousemove', (moveEvent: MouseEvent) => {
    moveHandlerRef.current(moveEvent);
  });

  useEventListener('mouseup', (upEvent: MouseEvent) => {
    upHandlerRef.current(upEvent);
  });

  return useCallback(
    (
      downHandler: (downEvent: MouseEvent) => EventHandler<'mousemove'> | void,
      upHandler: EventHandler<'mouseup'>
    ) => {
      return (downEvent: React.MouseEvent) => {
        if (downEvent.button !== MouseButton.Left) {
          return;
        }

        downEvent.preventDefault();
        downEvent.persist();

        const moveHandler = downHandler(downEvent.nativeEvent);

        // Handler could be canceled inside down handler
        if (moveHandler !== undefined) {
          moveHandlerRef.current = moveHandler;

          upHandlerRef.current = (upEvent: MouseEvent) => {
            upHandler(upEvent);
            moveHandlerRef.current = noop;
            upHandlerRef.current = noop;
          };
        }
      };
    },
    []
  );
}
