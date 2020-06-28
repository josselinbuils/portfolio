import React, { FC, useEffect, useState } from 'react';
import { useInjector } from '~/platform/hooks/useInjector';
import { Size } from '~/platform/interfaces/Size';
import { WindowManager } from '~/platform/services/WindowManager';
import { WindowInstance } from '~/platform/services/WindowManager/WindowInstance';

export const Windows: FC<Props> = ({ visibleAreaSize }) => {
  const windowManager = useInjector(WindowManager);
  const [windowInstances, setWindowInstances] = useState<WindowInstance[]>(() =>
    windowManager.getWindowInstances()
  );

  console.log({ windowInstances });

  useEffect(
    () => windowManager.windowInstancesSubject.subscribe(setWindowInstances),
    [windowManager]
  );

  return (
    <>
      {windowInstances.map(
        ({ id, windowComponent: WindowComponent, ...forwardedProps }) => (
          <WindowComponent
            key={id}
            id={id}
            onClose={windowManager.closeWindow}
            onMinimise={windowManager.hideWindow}
            onSelect={windowManager.selectWindow}
            visibleAreaSize={visibleAreaSize}
            {...forwardedProps}
          />
        )
      )}
    </>
  );
};

interface Props {
  visibleAreaSize: Size | undefined;
}
