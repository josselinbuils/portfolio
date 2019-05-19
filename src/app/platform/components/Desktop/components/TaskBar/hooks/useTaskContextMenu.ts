import { RefObject } from 'react';
import {
  ContextMenuDescriptor,
  ContextMenuItemDescriptor
} from '~/platform/components/ContextMenu';
import { WindowComponent } from '~/platform/components/Window';
import { useInjector } from '~/platform/hooks';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';

export function useTaskContextMenu(
  taskBarRef: RefObject<HTMLDivElement>,
  taskRef: RefObject<HTMLDivElement>,
  windowComponent: WindowComponent,
  windowInstance?: WindowInstance
): () => ContextMenuDescriptor {
  const windowManager = useInjector(WindowManager);

  return function getTaskContextMenuDescriptor(): ContextMenuDescriptor {
    if (taskBarRef.current === null) {
      throw new Error('Unable to retrieve taskbar html element');
    }
    if (taskRef.current === null) {
      throw new Error('Unable to retrieve task html element');
    }

    const x = taskBarRef.current.getBoundingClientRect().right;
    const y = taskRef.current.getBoundingClientRect().top;

    const items: ContextMenuItemDescriptor[] = [
      {
        iconClass: windowComponent.iconClass,
        title: windowComponent.appName,
        onClick: () => windowManager.openWindow(windowComponent)
      }
    ];

    if (windowInstance !== undefined) {
      items.push({
        iconClass: 'fas fa-times',
        title: 'Close',
        onClick: () => windowManager.closeWindow(windowInstance.id)
      });
    }

    return {
      items,
      position: { x, y },
      style: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        minHeight: taskRef.current.clientHeight
      }
    };
  };
}
