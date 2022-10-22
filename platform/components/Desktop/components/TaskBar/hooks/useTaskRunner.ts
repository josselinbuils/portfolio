import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';
import { useInjector } from '~/platform/providers/InjectorProvider/useInjector';
import { WindowInstance } from '~/platform/services/WindowManager/WindowInstance';
import { WindowManager } from '~/platform/services/WindowManager/WindowManager';

export function useTaskRunner(
  appDescriptor: AppDescriptor,
  windowInstance?: WindowInstance
): () => Promise<void> {
  const windowManager = useInjector(WindowManager);

  return async function run(): Promise<void> {
    if (windowInstance !== undefined) {
      const { id } = windowInstance;

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
      await windowManager.openApp(appDescriptor);
    }
  };
}
