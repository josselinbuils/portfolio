import React, { useCallback } from 'react';
import { MouseButton } from '~/platform/constants';
import { EventHandler } from '~/platform/interfaces';
import { useEventListener } from './useEventListener';

export function useDragAndDrop() {
  const listenEvent = useEventListener();

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
          const removeMoveListener = listenEvent('mousemove', moveHandler);
          const removeUpListener = listenEvent(
            'mouseup',
            (upEvent: MouseEvent) => {
              upHandler(upEvent);
              removeMoveListener();
              removeUpListener();
            }
          );
        }
      };
    },
    [listenEvent]
  );
}
