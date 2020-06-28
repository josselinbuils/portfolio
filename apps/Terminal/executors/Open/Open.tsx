import React, { useEffect, useMemo } from 'react';
import { useInjector } from '~/platform/providers/InjectorProvider/useInjector';
import { WindowManager } from '~/platform/services/WindowManager';
import { getAppDescriptors } from '~/platform/utils/getAppDescriptors';
import { CommandHelp } from '../../components/CommandHelp';
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
