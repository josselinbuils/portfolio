import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { type RefObject } from 'preact/compat';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';
import { type ContextMenuDescriptor } from '@/platform/providers/ContextMenuProvider/ContextMenuDescriptor';
import { type ContextMenuItemDescriptor } from '@/platform/providers/ContextMenuProvider/ContextMenuItemDescriptor';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';
import { windowManager } from '@/platform/services/windowManager/windowManager';

export function useTaskContextMenu(
  appDescriptor: AppDescriptor,
  taskRef: RefObject<HTMLElement>,
  windowInstance?: WindowInstance,
): () => ContextMenuDescriptor {
  return function getTaskContextMenuDescriptor(): ContextMenuDescriptor {
    if (taskRef.current === null) {
      throw new Error('Unable to retrieve task html element');
    }

    const { right: x, y } = taskRef.current.getBoundingClientRect();
    const items: ContextMenuItemDescriptor[] = [
      {
        icon: appDescriptor.icon,
        title: appDescriptor.name,
        onClick: () => windowManager.openApp(appDescriptor),
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
