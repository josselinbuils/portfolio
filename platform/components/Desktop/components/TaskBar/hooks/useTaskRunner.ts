import { useInjector } from '~/platform/hooks/useInjector';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';
import { WindowManager } from '~/platform/services/WindowManager';
import { WindowInstance } from '~/platform/services/WindowManager/WindowInstance';

export function useTaskRunner(
  appDescriptor: AppDescriptor,
  windowInstance?: WindowInstance
): () => Promise<void> {
  const windowManager = useInjector(WindowManager);

  return async function run(): Promise<void> {
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
      await windowManager.openWindow(appDescriptor);
    }
  };
}
