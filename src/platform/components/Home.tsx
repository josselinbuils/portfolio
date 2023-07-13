import { type FC } from 'preact/compat';
import { useEffect } from 'preact/compat';
import { type AppDescriptor } from '../interfaces/AppDescriptor';
import { ContextMenuProvider } from '../providers/ContextMenuProvider/ContextMenuProvider';
import { useInjector } from '../providers/InjectorProvider/useInjector';
import { TooltipProvider } from '../providers/TooltipProvider/TooltipProvider';
import { WindowManager } from '../services/WindowManager/WindowManager';
import { getAppDescriptors } from '../utils/getAppDescriptors';
import { Desktop } from './Desktop/Desktop';
import { type WindowComponent } from './Window/WindowComponent';

export interface DefaultApp {
  appDescriptor: AppDescriptor;
  windowComponent: WindowComponent;
}

interface Props {
  defaultApp?: DefaultApp;
  lazyApp?: string;
}

export const Home: FC<Props> = ({ defaultApp, lazyApp }) => {
  const windowManager = useInjector(WindowManager, (manager) => {
    if (defaultApp !== undefined) {
      const { appDescriptor, windowComponent } = defaultApp;
      manager.openApp(appDescriptor, undefined, windowComponent);
    }
  });

  useEffect(() => {
    if (lazyApp !== undefined) {
      const descriptor = getAppDescriptors()[lazyApp];

      if (descriptor !== undefined) {
        windowManager.openApp(descriptor, { startMaximized: true });
      }
    }
  }, [lazyApp, windowManager]);

  return (
    <ContextMenuProvider>
      <TooltipProvider>
        <Desktop />
      </TooltipProvider>
    </ContextMenuProvider>
  );
};
