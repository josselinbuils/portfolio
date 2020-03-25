import React, { useEffect } from 'react';
import { AppDescriptor } from '~/apps/AppDescriptor';
import { NotesDescriptor } from '~/apps/Notes/NotesDescriptor';
import { RedditDescriptor } from '~/apps/Reddit/RedditDescriptor';
import { TeraviaDescriptor } from '~/apps/Teravia/TeraviaDescriptor';
import { useInjector } from '~/platform/hooks';
import { WindowManager } from '~/platform/services';
import { Executor } from '../Executor';

import styles from './Open.module.scss';

// TODO find a way to retrieve registered apps automatically
const appDescriptors: { [name: string]: AppDescriptor } = {
  notes: NotesDescriptor,
  reddit: RedditDescriptor,
  teravia: TeraviaDescriptor,
};

export const Open: Executor = ({ args }) => {
  const windowManager = useInjector(WindowManager);
  const appNames = Object.keys(appDescriptors);
  const appDescriptor = appDescriptors[args[0]];
  const exists = appDescriptor !== undefined;

  useEffect(() => {
    if (exists) {
      windowManager.openWindow(appDescriptor);
    }
  }, [appDescriptor, exists, windowManager]);

  return exists ? null : (
    <div className={styles.help}>
      <p>Usage: open [application]</p>
      <p>Applications:</p>
      {appNames.map((name) => (
        <p className={styles.app} key={name}>
          - {name}
        </p>
      ))}
    </div>
  );
};
