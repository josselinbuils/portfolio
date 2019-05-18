import React, { FC, RefObject, useEffect, useState } from 'react';
import { useInjector } from '~/platform/hooks';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';

export const Windows: FC<Props> = ({ visibleAreaRef }) => {
  const windowManager = useInjector(WindowManager);
  const [windowInstances, setWindowInstances] = useState<WindowInstance[]>([]);

  useEffect(() => {
    return windowManager.windowInstancesSubject.subscribe(windowInstances => {
      setWindowInstances(windowInstances);
    });
  }, [windowManager]);

  return (
    <>
      {windowInstances.map(
        ({
          active,
          id,
          minimizedTopPosition,
          visible,
          windowComponent: WindowComponent,
          zIndex
        }) => (
          <WindowComponent
            active={active}
            key={id}
            id={id}
            minimizedTopPosition={minimizedTopPosition}
            onClose={windowManager.closeWindow}
            onMinimise={windowManager.hideWindow}
            onSelect={windowManager.selectWindow}
            visible={visible}
            visibleAreaRef={visibleAreaRef}
            zIndex={zIndex}
          />
        )
      )}
    </>
  );
};

interface Props {
  visibleAreaRef: RefObject<HTMLElement>;
}
