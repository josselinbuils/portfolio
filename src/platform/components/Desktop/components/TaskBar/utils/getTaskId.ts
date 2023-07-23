import { type TaskDescriptor } from '../TaskDescriptor';
import { isAppTaskDescriptor } from './isAppTaskDescriptor';

export function getTaskId(
  taskDescriptor: TaskDescriptor,
  // Necessary to recompute minimized position when task position changes
  index: number,
): string {
  const instanceKey =
    isAppTaskDescriptor(taskDescriptor) &&
    taskDescriptor.windowInstance !== undefined
      ? taskDescriptor.windowInstance.id
      : '';

  return `${taskDescriptor.name}${index}${instanceKey}`;
}
