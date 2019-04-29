import React, { FC, useState } from 'react';
import { WindowManager } from './WindowManager';
import { WindowProviderContext } from './WindowProviderContext';

export const WindowProvider: FC = ({ children }) => {
  const [windowManager] = useState(() => new WindowManager());

  return (
    <WindowProviderContext.Provider value={windowManager}>
      {children}
    </WindowProviderContext.Provider>
  );
};
