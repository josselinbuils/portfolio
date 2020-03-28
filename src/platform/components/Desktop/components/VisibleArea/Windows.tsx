import React, { FC, useLayoutEffect, useState } from 'react';
import { useInjector } from '~/platform/hooks';
import { Size } from '~/platform/interfaces';
import {
  WindowInstance,
  WindowManager,
} from '~/platform/services/WindowManager';

export const Windows: FC<Props> = ({ visibleAreaSize }) => {
  const windowManager = useInjector(WindowManager);
  const [windowInstances, setWindowInstances] = useState<WindowInstance[]>(() =>
    windowManager.getWindowInstances()
  );

  useLayoutEffect(
    () => windowManager.windowInstancesSubject.subscribe(setWindowInstances),
    [windowManager]
  );

  return (
    <>
      {windowInstances.map(
        ({
          active,
          id,
          minimizedTopPosition,
          ref,
          windowComponent: WindowComponent,
          zIndex,
        }) => (
          <WindowComponent
            active={active}
            key={id}
            id={id}
            minimizedTopPosition={minimizedTopPosition}
            onClose={windowManager.closeWindow}
            onMinimise={windowManager.hideWindow}
            onSelect={windowManager.selectWindow}
            visibleAreaSize={visibleAreaSize}
            windowRef={ref}
            zIndex={zIndex}
          />
        )
      )}
    </>
  );
};

interface Props {
  visibleAreaSize: Size | undefined;
}
