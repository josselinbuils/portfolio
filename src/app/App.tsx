import React from 'react';
import { TaskBar } from '~/platform/components/TaskBar';
import { ContextMenuProvider } from '~/platform/providers/ContextMenuProvider';
import { WindowProvider } from '~/platform/providers/WindowProvider';
import styles from './App.module.scss';

export const App = () => {
  return (
    <main className={styles.app}>
      <ContextMenuProvider>
        <WindowProvider>
          <TaskBar />
        </WindowProvider>
      </ContextMenuProvider>
    </main>
  );
};
