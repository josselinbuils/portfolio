import React, { FC, useEffect, useState } from 'react';
import { useInjector } from '~/platform/hooks';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';

export const Windows: FC = () => {
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
          minimizedPosition,
          visible,
          windowComponent: WindowComponent,
          zIndex
        }) => (
          <WindowComponent
            active={active}
            key={id}
            id={id}
            minimizedPosition={minimizedPosition}
            onClose={windowManager.closeWindow}
            onMinimise={windowManager.hideWindow}
            onSelect={windowManager.selectWindow}
            visible={visible}
            zIndex={zIndex}
          />
        )
      )}
    </>
  );
};
