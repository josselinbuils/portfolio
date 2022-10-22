import type { TaskDescriptor } from '../TaskDescriptor';

export function getTaskId(
  { appDescriptor, windowInstance }: TaskDescriptor,
  // Necessary to recompute minimized position when task position changes
  index: number
): string {
  const instanceKey = windowInstance !== undefined ? windowInstance.id : '';
  return `${appDescriptor.name}${index}${instanceKey}`;
}
