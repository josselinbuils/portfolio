import { WindowComponent } from '~/platform/components/Window';
import { useInjector } from '~/platform/hooks';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';

export function useTaskRunner(
  windowComponent: WindowComponent,
  windowInstance?: WindowInstance
) {
  const windowManager = useInjector(WindowManager);

  return function run() {
    if (windowInstance !== undefined) {
      const id = windowInstance.id;

      if (windowManager.isWindowVisible(id)) {
        if (windowManager.isWindowSelected(id)) {
          windowManager.hideWindow(id);
        } else {
          windowManager.selectWindow(id);
        }
      } else {
        windowManager.showWindow(id);
      }
    } else {
      windowManager.openWindow(windowComponent);
    }
  };
}
