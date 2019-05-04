import {
  WindowComponent,
  WindowInstance
} from '~/platform/providers/WindowProvider';

export function getTaskKey(
  windowComponent: WindowComponent,
  windowInstance: WindowInstance | undefined
): string {
  const instanceKey = windowInstance !== undefined ? windowInstance.id : '';
  return `${windowComponent.appName}${instanceKey}`;
}
