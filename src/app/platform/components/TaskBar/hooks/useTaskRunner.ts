import { useWindowManager } from '~/platform/providers/WindowProvider';
import { Task } from '~/platform/components/TaskBar/Task';

export function useTaskRunner() {
  const windowManager = useWindowManager();

  return function run(task: Task) {
    if (task.instance !== undefined) {
      const id = task.instance.id;

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
      windowManager.openWindow(task.component);
    }
  };
}
