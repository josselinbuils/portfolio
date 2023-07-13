import { useEffect, useMemo } from 'preact/compat';
import { useInjector } from '@/platform/providers/InjectorProvider/useInjector';
import { WindowManager } from '@/platform/services/WindowManager/WindowManager';
// Open executor dynamically imported in Terminal so no cycle
// eslint-disable-next-line import/no-cycle
import { getAppDescriptors } from '@/platform/utils/getAppDescriptors';
import { CommandHelp } from '../components/CommandHelp/CommandHelp';
import { type Executor } from './Executor';

export const Open: Executor = ({ args }) => {
  const windowManager = useInjector(WindowManager);
  const appDescriptors = useMemo(getAppDescriptors, []);
  const appNames = Object.keys(appDescriptors);
  const appDescriptor = appDescriptors[args[0]];
  const exists = appDescriptor !== undefined;

  useEffect(() => {
    if (exists) {
      windowManager.openApp(appDescriptor);
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

Open.suggest = (arg: string): string | undefined =>
  Object.keys(getAppDescriptors()).find((appName) => appName.startsWith(arg));
