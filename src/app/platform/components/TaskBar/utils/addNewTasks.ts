import { WindowInstance } from '~/platform/providers/WindowProvider';
import { Task } from '../Task';

export function addNewTasks(
  windowInstances: WindowInstance[],
  tasks: Task[]
): Task[] {
  windowInstances
    // Keep only new instances
    .filter(windowInstance => {
      return tasks.find(task => task.instance === windowInstance) === undefined;
    })
    .forEach(windowInstance => {
      // Try to find a task without instance for this component (possible only if pinned)
      const pinnedTask = tasks.find(task => {
        return (
          task.component === windowInstance.component &&
          task.instance === undefined
        );
      });
      let newTask: Task | undefined;

      if (pinnedTask !== undefined) {
        pinnedTask.instance = windowInstance;
        // newTask = pinnedTask;
      } else {
        newTask = new Task(windowInstance.component, false, windowInstance);
        tasks.push(newTask);
      }

      // if (newTask !== undefined) {
      //   setTimeout(() => {
      //     const taskElement = document.getElementById((newTask as Task).id);
      //
      //     if (taskElement === null) {
      //       throw new Error('Task element not found');
      //     }
      //
      //     const taskClientRect = taskElement.getBoundingClientRect();
      //     const topPosition = Math.round(
      //       taskClientRect.top + taskClientRect.height / 3
      //     );
      //     windowInstance.windowComponent.setMinimizedTopPosition(topPosition);
      //   }, 0);
      // }
    });

  return tasks;
}
