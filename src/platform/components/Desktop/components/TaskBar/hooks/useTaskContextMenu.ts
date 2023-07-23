import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { type RefObject } from 'preact/compat';
import { type ContextMenuDescriptor } from '@/platform/providers/ContextMenuProvider/ContextMenuDescriptor';
import { type ContextMenuItemDescriptor } from '@/platform/providers/ContextMenuProvider/ContextMenuItemDescriptor';
import { windowManager } from '@/platform/services/windowManager/windowManager';
import { type TaskDescriptor } from '../TaskDescriptor';
import { isAppTaskDescriptor } from '../utils/isAppTaskDescriptor';

export function useTaskContextMenu(
  taskDescriptor: TaskDescriptor,
  taskRef: RefObject<HTMLElement>,
): () => ContextMenuDescriptor | undefined {
  return function getTaskContextMenuDescriptor() {
    if (!isAppTaskDescriptor(taskDescriptor)) {
      return undefined;
    }

    if (taskRef.current === null) {
      throw new Error('Unable to retrieve task html element');
    }

    const { icon, name, windowInstance } = taskDescriptor;
    const { right: x, y } = taskRef.current.getBoundingClientRect();
    const items: ContextMenuItemDescriptor[] = [
      {
        icon,
        title: name,
        onClick: () => windowManager.openApp(taskDescriptor),
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
