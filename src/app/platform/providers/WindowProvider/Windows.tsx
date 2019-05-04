import React, { FC, useEffect, useState } from 'react';
import { useWindowManager } from './hooks';
import { WindowInstance } from './WindowInstance';

export const Windows: FC = () => {
  const windowManager = useWindowManager();
  const [windowInstances, setWindowInstances] = useState<WindowInstance[]>([]);

  useEffect(() => {
    return windowManager.windowInstancesSubject.subscribe(windowInstances => {
      setWindowInstances(windowInstances);
    });
  }, [windowManager]);

  return (
    <>
      {windowInstances.map(
        ({ active, id, visible, windowComponent: WindowComponent, zIndex }) => (
          <WindowComponent
            active={active}
            key={id}
            id={id}
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
