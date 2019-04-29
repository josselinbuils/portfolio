import { WindowInstance } from '~/platform/providers/WindowProvider';
import { Task } from '../Task';

export function removeOutdatedTasks(
  windowInstances: WindowInstance[],
  tasks: Task[]
): Task[] {
  tasks.forEach((task, index) => {
    if (
      task.instance !== undefined &&
      !windowInstances.includes(task.instance)
    ) {
      if (task.pinned) {
        const firstRelatedTask = tasks.find(
          t => t !== task && t.component === task.component
        );

        if (firstRelatedTask === undefined) {
          // There was only 1 instance for this component, deletes the instance
          delete task.instance;
        } else {
          // There were multiple instances of the component, removes the next
          // task of the component and puts its instance in this task
          task.instance = firstRelatedTask.instance;
          tasks.splice(tasks.indexOf(firstRelatedTask), 1);
        }
      } else {
        tasks.splice(index, 1);
      }
    }
  });
  return tasks;
}
