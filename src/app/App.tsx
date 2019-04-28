import React, { useContext, useEffect } from 'react';
import { Notes } from '~/apps/Notes';
import { ContextMenuProvider } from '~/platform/providers/ContextMenuProvider';
import {
  WindowManager,
  WindowProviderContext
} from '~/platform/providers/WindowProvider';
import './App.scss';

export const App = () => {
  const windowManager = useContext(WindowProviderContext) as WindowManager;

  useEffect(() => windowManager.openWindow(Notes), [windowManager]);

  return (
    <ContextMenuProvider>
      <main className="App" />
    </ContextMenuProvider>
  );
};
