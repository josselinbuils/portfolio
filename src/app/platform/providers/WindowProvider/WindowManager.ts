import { ElementType } from 'react';
import { Subject } from '~/platform/utils';
import { WindowInstance } from './WindowInstance';

export class WindowManager extends Subject<WindowInstance[]> {
  windowInstancesSubject = new Subject<WindowInstance[]>([]);

  private readonly windowInstances: WindowInstance[] = [];
  private id = -1;

  closeWindow = (id: number): void => {
    const index = this.windowInstances.findIndex(
      instance => instance.id === id
    );

    if (index === -1) {
      throw new Error('Unable to close window: not found');
    }
    this.windowInstances.splice(index, 1);
    this.publishWindowInstances();
  };

  hideWindow = (id: number): void => {
    this.getWindowInstance(id).visible = false;
    this.unselectWindow(id);
  };

  isWindowSelected(id: number): boolean {
    return this.getWindowInstance(id).active;
  }

  isWindowVisible(id: number): boolean {
    return this.getWindowInstance(id).visible;
  }

  openWindow(component: ElementType): void {
    const windowInstance: WindowInstance = {
      active: false,
      id: ++this.id,
      component,
      visible: true,
      zIndex: 0
    };

    this.windowInstances.push(windowInstance);
    this.selectWindow(windowInstance.id);
  }

  showWindow(id: number): void {
    this.getWindowInstance(id).visible = true;
    this.selectWindow(id);
  }

  selectWindow = (id: number): void => {
    let i = 0;

    this.windowInstances
      .filter(instance => instance.id !== id)
      .sort((a, b) => (a.zIndex < b.zIndex ? -1 : 1))
      .forEach(instance => {
        instance.active = false;
        instance.zIndex = ++i;
      });

    const instance = this.getWindowInstance(id);
    instance.active = true;
    instance.zIndex = ++i;

    this.publishWindowInstances();
  };

  unselectAllWindows(): void {
    this.windowInstances.forEach(instance => (instance.active = false));
    this.publishWindowInstances();
  }

  unselectWindow(id: number): void {
    this.getWindowInstance(id).active = false;
    this.publishWindowInstances();
  }

  private getWindowInstance(id: number): WindowInstance {
    const windowInstance = this.windowInstances.find(
      instance => instance.id === id
    );

    if (windowInstance === undefined) {
      throw new Error(`Unable to find a window instance with id ${id}`);
    }
    return windowInstance;
  }

  private publishWindowInstances(): void {
    this.windowInstancesSubject.next([...this.windowInstances]);
  }
}
