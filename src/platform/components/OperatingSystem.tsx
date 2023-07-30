import { type FC, useEffect } from 'preact/compat';
import '../global.scss';
import { type AppDescriptor } from '../interfaces/AppDescriptor';
import { windowManager } from '../services/windowManager/windowManager';
import { getAppDescriptors } from '../utils/getAppDescriptors';
import { Desktop } from './Desktop/Desktop';
import { type WindowComponent } from './Window/WindowComponent';

export interface DefaultApp {
  appDescriptor: AppDescriptor;
  windowComponent: WindowComponent;
}

export interface OperatingSystemProps {
  defaultApp?: DefaultApp;
  lazyApp?: string;
}

let initialised = false;

export const OperatingSystem: FC<OperatingSystemProps> = ({
  defaultApp,
  lazyApp,
}) => {
  if (defaultApp !== undefined && !initialised) {
    const { appDescriptor, windowComponent } = defaultApp;
    windowManager.openApp(appDescriptor, undefined, windowComponent);
    initialised = true;
  }

  useEffect(() => {
    if (lazyApp !== undefined) {
      const descriptor = getAppDescriptors()[lazyApp.toLowerCase()];

      if (descriptor !== undefined) {
        windowManager.openApp(descriptor, { startMaximized: true });
      }
    }
  }, [lazyApp]);

  return <Desktop />;
};
