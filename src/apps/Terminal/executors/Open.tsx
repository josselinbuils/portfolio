import { useEffect, useMemo } from 'preact/hooks';

import { windowManager } from '@/platform/services/windowManager/windowManager';
import { getAppDescriptors } from '@/platform/utils/getAppDescriptors';

import { CommandHelp } from '../components/CommandHelp/CommandHelp';
import { type Executor } from './Executor';

export const Open: Executor = ({ args }) => {
  const appDescriptors = useMemo(getAppDescriptors, []);
  const appNames = Object.keys(appDescriptors);
  const appDescriptor = appDescriptors[args[0]];
  const exists = appDescriptor !== undefined;

  useEffect(() => {
    if (exists) {
      windowManager.openApp(appDescriptor);
    }
  }, [appDescriptor, exists]);

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

Open.suggest = (arg: string): string | undefined =>
  Object.keys(getAppDescriptors()).find((appName) => appName.startsWith(arg));
