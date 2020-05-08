import { AppDescriptor } from '~/apps/AppDescriptor';
import { WindowInstance } from '~/platform/services/WindowManager/WindowInstance';

export function getTaskKey(
  appDescriptor: AppDescriptor,
  windowInstance: WindowInstance | undefined,
  // Necessary to recompute minimized position when task position changes
  index: number
): string {
  const instanceKey = windowInstance !== undefined ? windowInstance.id : '';
  return `${appDescriptor.appName}${index}${instanceKey}`;
}
