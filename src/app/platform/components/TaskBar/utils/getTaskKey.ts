import { WindowComponent } from '~/platform/components/Window';
import { WindowInstance } from '~/platform/services/WindowManager';

export function getTaskKey(
  windowComponent: WindowComponent,
  windowInstance: WindowInstance | undefined,
  // Necessary to recompute minimized position when task position changes
  index: number
): string {
  const instanceKey = windowInstance !== undefined ? windowInstance.id : '';
  return `${windowComponent.appName}${index}${instanceKey}`;
}
