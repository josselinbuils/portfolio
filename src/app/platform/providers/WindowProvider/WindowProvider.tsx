import React, { FC, useEffect, useState } from 'react';
import { WindowInstance } from './WindowInstance';
import { WindowManager } from './WindowManager';
import { TestWindow } from '~/TestWindow';

export const WindowProviderContext = React.createContext<
  WindowManager | undefined
>(undefined);

export const WindowProvider: FC = ({ children }) => {
  const [windowManager] = useState(new WindowManager());
  const [windowInstances, setWindowInstances] = useState<WindowInstance[]>([]);

  useEffect(() => {
    windowManager.windowInstancesSubject.subscribe(setWindowInstances);
    windowManager.openWindow(TestWindow);
  }, [windowManager]);

  return (
    <WindowProviderContext.Provider value={windowManager}>
      {children}
      {windowInstances.map(
        ({ active, component: Component, id, visible, zIndex }) => (
          <Component
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
    </WindowProviderContext.Provider>
  );
};
