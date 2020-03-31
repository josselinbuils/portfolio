import React, { useEffect, useMemo } from 'react';
import { AppDescriptor } from '~/apps/AppDescriptor';
import { CommandHelp } from '~/apps/Terminal/components';
import { PINNED_APPS_DESCRIPTORS } from '~/platform/components/Desktop/components/TaskBar';
import { useInjector } from '~/platform/hooks';
import { WindowManager } from '~/platform/services';
import { Executor } from '../Executor';

export const Open: Executor = ({ args }) => {
  const windowManager = useInjector(WindowManager);
  const appDescriptors = useMemo(getAppDescriptors, []);
  const appNames = Object.keys(appDescriptors);
  const appDescriptor = appDescriptors[args[0]];
  const exists = appDescriptor !== undefined;

  useEffect(() => {
    if (exists) {
      windowManager.openWindow(appDescriptor);
    }
  }, [appDescriptor, exists, windowManager]);

  return exists ? null : (
    <CommandHelp
      command="open"
      description="Open an application"
      parameters={[
        {
          name: 'application',
          values: appNames.map((name) => ({ value: name })),
        },
      ]}
    />
  );
};

function getAppDescriptors(): { [name: string]: AppDescriptor } {
  const descriptors = {} as { [name: string]: AppDescriptor };

  PINNED_APPS_DESCRIPTORS.slice()
    .sort((a, b) =>
      a.appName.toLocaleLowerCase() > b.appName.toLowerCase() ? 1 : -1
    )
    .forEach((descriptor) => {
      descriptors[descriptor.appName.toLocaleLowerCase()] = descriptor;
    });

  return descriptors;
}
