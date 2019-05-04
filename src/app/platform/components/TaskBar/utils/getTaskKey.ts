import { WindowComponent } from '~/platform/components/Window';
import { WindowInstance } from '~/platform/services/WindowManager';

export function getTaskKey(
  windowComponent: WindowComponent,
  windowInstance: WindowInstance | undefined
): string {
  const instanceKey = windowInstance !== undefined ? windowInstance.id : '';
  return `${windowComponent.appName}${instanceKey}`;
}
