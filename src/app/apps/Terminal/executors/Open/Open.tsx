import React, { useEffect } from 'react';
import { Notes, Teravia } from '~/apps';
import { WindowComponent } from '~/platform/components/Window';
import { useInjector } from '~/platform/hooks';
import { WindowManager } from '~/platform/services';
import { Executor } from '../Executor';
import styles from './Open.module.scss';

// TODO find a way to retrieve registered apps automatically
const apps: { [name: string]: WindowComponent } = {
  notes: Notes,
  teravia: Teravia
};

export const Open: Executor = ({ args }) => {
  const windowManager = useInjector(WindowManager);
  const appNames = Object.keys(apps);
  const app = apps[args[0]];
  const exists = app !== undefined;

  useEffect(() => {
    if (exists) {
      windowManager.openWindow(app);
    }
  }, [app, exists, windowManager]);

  return exists ? null : (
    <div className={styles.help}>
      <p>Usage: open [application]</p>
      <p>Applications:</p>
      {appNames.map(name => (
        <p className={styles.app} key={name}>
          - {name}
        </p>
      ))}
    </div>
  );
};
