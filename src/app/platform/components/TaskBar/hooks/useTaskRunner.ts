import {
  useWindowManager,
  WindowComponent,
  WindowInstance
} from '~/platform/providers/WindowProvider';

export function useTaskRunner(
  windowComponent: WindowComponent,
  windowInstance?: WindowInstance
) {
  const windowManager = useWindowManager();

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
