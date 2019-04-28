import React, { useContext, useEffect } from 'react';
import { TestApp } from '~/apps/TestApp';
import { ContextMenuProvider } from '~/platform/providers/ContextMenuProvider';
import {
  WindowManager,
  WindowProviderContext
} from '~/platform/providers/WindowProvider';
import './App.scss';

export const App = () => {
  const windowManager = useContext(WindowProviderContext) as WindowManager;

  useEffect(() => windowManager.openWindow(TestApp), [windowManager]);

  return (
    <ContextMenuProvider>
      <main className="App" />
    </ContextMenuProvider>
  );
};
