import React, { FC, useLayoutEffect, useState } from 'react';
import { useInjector } from '~/platform/hooks/useInjector';
import { Size } from '~/platform/interfaces/Size';
import { WindowManager } from '~/platform/services/WindowManager';
import { WindowInstance } from '~/platform/services/WindowManager/WindowInstance';

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
