import React from 'react';
import { ContextMenuProvider } from '~/platform/providers/ContextMenuProvider';
import './App.scss';
import { WindowProvider } from '~/platform/providers/WindowProvider/WindowProvider';

export const App = () => (
  <ContextMenuProvider>
    <main className="App">
      <WindowProvider />
    </main>
  </ContextMenuProvider>
);
