import { AppDescriptor } from '~/apps/AppDescriptor';
import { useInjector } from '~/platform/hooks';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';

export function useTaskRunner(
  appDescriptor: AppDescriptor,
  windowInstance?: WindowInstance
): () => void {
  const windowManager = useInjector(WindowManager);

  return function run(): void {
    if (windowInstance !== undefined) {
      const id = windowInstance.id;

      if (windowManager.isWindowVisible(id)) {
        if (windowManager.isWindowSelected(id)) {
          windowManager.hideWindow(id);
        } else {
          windowManager.selectWindow(id);
        }
      } else {
        windowManager.showWindow(id);
      }
    } else {
      windowManager.openWindow(appDescriptor);
    }
  };
}
