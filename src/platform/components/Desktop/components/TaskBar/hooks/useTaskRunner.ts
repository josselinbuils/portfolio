import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';
import { windowManager } from '@/platform/services/windowManager/windowManager';

export function useTaskRunner(
  appDescriptor: AppDescriptor,
  windowInstance?: WindowInstance,
): () => Promise<void> {
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
