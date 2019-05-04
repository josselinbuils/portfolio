import React, { useEffect } from 'react';
import { Terminal } from '~/apps';
import { Desktop, TaskBar } from '~/platform/components';
import { ContextMenuProvider } from '~/platform/providers/ContextMenuProvider';
import { useWindowManager, Windows } from '~/platform/providers/WindowProvider';

export const App = () => {
  const windowManager = useWindowManager();

  useEffect(() => windowManager.openWindow(Terminal), [windowManager]);

  return (
    <ContextMenuProvider>
      <Desktop />
      <TaskBar />
      <Windows />
    </ContextMenuProvider>
  );
};
