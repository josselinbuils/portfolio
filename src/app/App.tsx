import React, { useEffect } from 'react';
import { Terminal } from '~/apps';
import { Desktop, TaskBar } from '~/platform/components';
import { useInjector } from '~/platform/hooks';
import { ContextMenuProvider } from '~/platform/providers';
import { WindowManager } from '~/platform/services';
import styles from './App.module.scss';

export const App = () => {
  const windowManager = useInjector(WindowManager);

  useEffect(() => windowManager.openWindow(Terminal), [windowManager]);

  return (
    <ContextMenuProvider>
      <main className={styles.app}>
        <TaskBar />
        <Desktop />
      </main>
    </ContextMenuProvider>
  );
};
