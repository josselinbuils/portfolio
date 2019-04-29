import { Task } from '../Task';

export function isTaskActive(task: Task) {
  return task.instance && task.instance.active;
}
