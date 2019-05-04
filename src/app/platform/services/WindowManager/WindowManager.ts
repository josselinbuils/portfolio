import { Subject } from '~/platform/utils';
import { WindowInstance } from './WindowInstance';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';

export class WindowManager {
  windowInstancesSubject = new Subject<WindowInstance[]>([]);

  private readonly windowInstances: WindowInstance[] = [];
  private id = -1;

  closeWindow = (id: number): void => {
    const index = this.windowInstances.findIndex(
      windowInstance => windowInstance.id === id
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

  openWindow(windowComponent: WindowComponent): void {
    const windowInstance: WindowInstance = {
      active: false,
      id: ++this.id,
      visible: true,
      windowComponent,
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
    const windowInstance = this.getWindowInstance(id);

    if (!windowInstance.active) {
      let i = 0;

      this.windowInstances
        .filter(windowInstance => windowInstance.id !== id)
        .sort((a, b) => (a.zIndex < b.zIndex ? -1 : 1))
        .forEach(windowInstance => {
          windowInstance.active = false;
          windowInstance.zIndex = ++i;
        });

      windowInstance.active = true;
      windowInstance.zIndex = ++i;

      this.publishWindowInstances();
    }
  };

  unselectAllWindows(): void {
    const isThereWindowSelected = this.windowInstances.some(
      ({ active }) => active
    );

    if (isThereWindowSelected) {
      this.windowInstances.forEach(windowInstance => {
        windowInstance.active = false;
      });
      this.publishWindowInstances();
    }
  }

  unselectWindow(id: number): void {
    const windowInstance = this.getWindowInstance(id);

    if (windowInstance.active) {
      windowInstance.active = false;
      this.publishWindowInstances();
    }
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
