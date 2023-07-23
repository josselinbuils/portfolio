import { type AppTaskDescriptor, type TaskDescriptor } from '../TaskDescriptor';

export function isAppTaskDescriptor(
  taskDescriptor: TaskDescriptor,
): taskDescriptor is AppTaskDescriptor {
  return (taskDescriptor as AppTaskDescriptor).factory !== undefined;
}
