import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { RefObject } from 'react';
import { AppDescriptor } from '~/apps/AppDescriptor';
import {
  ContextMenuDescriptor,
  ContextMenuItemDescriptor,
} from '~/platform/components/ContextMenu';
import { useInjector } from '~/platform/hooks';
import {
  WindowInstance,
  WindowManager,
} from '~/platform/services/WindowManager';

export function useTaskContextMenu(
  appDescriptor: AppDescriptor,
  taskBarRef: RefObject<HTMLDivElement>,
  taskRef: RefObject<HTMLDivElement>,
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
        icon: appDescriptor.icon,
        title: appDescriptor.appName,
        onClick: () => windowManager.openWindow(appDescriptor),
      },
    ];

    if (windowInstance !== undefined) {
      items.push({
        icon: faTimes,
        title: 'Close',
        onClick: () => windowManager.closeWindow(windowInstance.id),
      });
    }

    return {
      items,
      position: { x, y },
      style: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        minHeight: taskRef.current.clientHeight,
      },
    };
  };
}
