import React, { FC, useEffect, useState } from 'react';
import { useInjector } from '~/platform/hooks';
import { Size } from '~/platform/interfaces';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';

export const Windows: FC<Props> = ({ visibleAreaSize }) => {
  const windowManager = useInjector(WindowManager);
  const [windowInstances, setWindowInstances] = useState<WindowInstance[]>([]);

  useEffect(
    () =>
      windowManager.windowInstancesSubject.subscribe(windowInstances =>
        setWindowInstances(windowInstances)
      ),
    [windowManager]
  );

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
            visibleAreaSize={visibleAreaSize}
            zIndex={zIndex}
          />
        )
      )}
    </>
  );
};

interface Props {
  visibleAreaSize: Size;
}
