import { windowManager } from '@/platform/services/windowManager/windowManager';
import { type TaskDescriptor } from '../TaskDescriptor';
import { isAppTaskDescriptor } from '../utils/isAppTaskDescriptor';

export function useTaskRunner(
  taskDescriptor: TaskDescriptor,
): () => Promise<void> {
  return async function run(): Promise<void> {
    if (!isAppTaskDescriptor(taskDescriptor)) {
      await taskDescriptor.action();
    } else if (taskDescriptor.windowInstance !== undefined) {
      const { id } = taskDescriptor.windowInstance;

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
      await windowManager.openApp(taskDescriptor);
    }
  };
}
