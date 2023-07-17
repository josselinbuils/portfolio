import { type FC } from 'preact/compat';
import { useEffect } from 'preact/compat';
import { windowManager } from '@/platform/services/windowManager/windowManager';
import { type AppDescriptor } from '../interfaces/AppDescriptor';
import { ContextMenuProvider } from '../providers/ContextMenuProvider/ContextMenuProvider';
import { getAppDescriptors } from '../utils/getAppDescriptors';
import { Desktop } from './Desktop/Desktop';
import { type WindowComponent } from './Window/WindowComponent';

export interface DefaultApp {
  appDescriptor: AppDescriptor;
  windowComponent: WindowComponent;
}

export interface AppProps {
  defaultApp?: DefaultApp;
  lazyApp?: string;
}

let initialised = false;

export const App: FC<AppProps> = ({ defaultApp, lazyApp }) => {
  if (defaultApp !== undefined && !initialised) {
    const { appDescriptor, windowComponent } = defaultApp;
    windowManager.openApp(appDescriptor, undefined, windowComponent);
    initialised = true;
  }

  useEffect(() => {
    if (lazyApp !== undefined) {
      const descriptor = getAppDescriptors()[lazyApp];

      if (descriptor !== undefined) {
        windowManager.openApp(descriptor, { startMaximized: true });
      }
    }
  }, [lazyApp]);

  return (
    <ContextMenuProvider>
      <Desktop />
    </ContextMenuProvider>
  );
};
