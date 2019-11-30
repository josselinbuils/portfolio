import React, { useEffect } from 'react';
import { TerminalDescriptor } from '~/apps/Terminal/TerminalDescriptor';
import { Desktop } from '~/platform/components';
import { useInjector } from '~/platform/hooks';
import { ContextMenuProvider } from '~/platform/providers';
import { WindowManager } from '~/platform/services';

export const App = () => {
  const windowManager = useInjector(WindowManager);

  useEffect(() => {
    windowManager.openWindow(TerminalDescriptor);
  }, [windowManager]);

  return (
    <ContextMenuProvider>
      <Desktop />
    </ContextMenuProvider>
  );
};
