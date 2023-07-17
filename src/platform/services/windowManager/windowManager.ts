import { Subject } from '@josselinbuils/utils/Subject';
import { createRef } from 'preact/compat';
import { type WindowProps } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';
import { type WindowInstance } from './WindowInstance';

const windowInstances: WindowInstance[] = [];
let nextInstanceId = 0;

export const windowManager = {
  windowInstancesSubject: new Subject<WindowInstance[]>([]),

  closeWindow(id: number): void {
    const index = windowInstances.findIndex(
      (windowInstance) => windowInstance.id === id,
    );

    if (index === -1) {
      throw new Error('Unable to close window: not found');
    }
    windowInstances.splice(index, 1);
    publishWindowInstances();
  },

  hideWindow(id: number): void {
    const componentInstance = getWindowInstance(id).windowRef.current;

    if (componentInstance !== null) {
      componentInstance.hide();
      this.unselectWindow(id);
    }
  },

  getWindowInstances(): WindowInstance[] {
    return windowInstances;
  },

  isWindowSelected(id: number): boolean {
    return getWindowInstance(id).active;
  },

  isWindowVisible(id: number): boolean {
    const componentInstance = getWindowInstance(id).windowRef.current;
    return componentInstance !== null ? componentInstance.visible : false;
  },

  async openApp<T extends Partial<WindowProps>>(
    appDescriptor: AppDescriptor,
    windowProps: Partial<T> = {},
    windowComponent?: WindowComponent,
  ): Promise<void> {
    if (windowComponent === undefined) {
      windowComponent = (await appDescriptor.factory()).default;
    }

    const windowInstance: WindowInstance = {
      ...windowProps,
      active: false,
      appDescriptor,
      id: nextInstanceId,
      windowComponent,
      windowRef: createRef(),
      zIndex: 0,
    };
    nextInstanceId++;

    windowInstances.push(windowInstance);
    this.selectWindow(windowInstance.id);
  },

  setMinimizedTopPosition(id: number, topPosition: number): void {
    getWindowInstance(id).minimizedTopPosition = topPosition;
    publishWindowInstances();
  },

  showWindow(id: number): void {
    const componentInstance = getWindowInstance(id).windowRef.current;

    if (componentInstance !== null) {
      componentInstance.show();
      this.selectWindow(id);
    }
  },

  selectWindow(id: number): void {
    const windowInstance = getWindowInstance(id);

    if (!windowInstance.active) {
      let i = 0;

      windowInstances
        .filter((instance) => instance.id !== id)
        .sort((a, b) => (a.zIndex < b.zIndex ? -1 : 1))
        .forEach((instance) => {
          instance.active = false;
          instance.zIndex = ++i;
        });

      windowInstance.active = true;
      windowInstance.zIndex = ++i;
      windowInstance.windowRef.current?.focus();

      publishWindowInstances();
    }
  },

  unselectAllWindows(): void {
    const isThereWindowSelected = windowInstances.some(({ active }) => active);

    if (isThereWindowSelected) {
      windowInstances.forEach((windowInstance) => {
        windowInstance.active = false;
      });
      publishWindowInstances();
    }
  },

  unselectWindow(id: number): void {
    const windowInstance = getWindowInstance(id);

    if (windowInstance.active) {
      windowInstance.active = false;
      publishWindowInstances();
    }
  },
};

function getWindowInstance(id: number): WindowInstance {
  const windowInstance = windowInstances.find((instance) => instance.id === id);

  if (windowInstance === undefined) {
    throw new Error(`Unable to find a window instance with id ${id}`);
  }
  return windowInstance;
}

function publishWindowInstances(): void {
  windowManager.windowInstancesSubject.next([...windowInstances]);
}
