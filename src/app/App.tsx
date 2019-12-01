import React, { useEffect } from 'react';
import Terminal from '~/apps/Terminal';
import { Desktop } from '~/platform/components';
import { useInjector } from '~/platform/hooks';
import { ContextMenuProvider } from '~/platform/providers';
import { WindowManager } from '~/platform/services';

export const App = () => {
  const windowManager = useInjector(WindowManager);

  useEffect(() => {
    windowManager.openWindow(Terminal);
  }, [windowManager]);

  return (
    <ContextMenuProvider>
      <Desktop />
    </ContextMenuProvider>
  );
};
