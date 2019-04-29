import { RefObject } from 'react';
import { ContextMenuItemDescriptor } from '~/platform/components/ContextMenu';
import { useWindowManager } from '~/platform/providers/WindowProvider';
import { Task } from '../Task';

export function useDescriptorFactory(taskBarRef: RefObject<HTMLDivElement>) {
  const windowManager = useWindowManager();

  function getTaskContextMenuDescriptor(task: Task) {
    const { component, iconClass, instance, name, ref } = task;

    if (taskBarRef.current === null) {
      throw new Error('Unable to retrieve taskbar html element');
    }
    if (ref.current === null) {
      throw new Error('Unable to retrieve task html element');
    }

    const x = taskBarRef.current.getBoundingClientRect().right;
    const y = ref.current.getBoundingClientRect().top;

    const items: ContextMenuItemDescriptor[] = [
      {
        iconClass,
        title: name,
        onClick: () => windowManager.openWindow(component)
      }
    ];

    if (instance !== undefined) {
      items.push({
        iconClass: 'fas fa-times',
        title: 'Close',
        onClick: () => {
          if (task.instance !== undefined) {
            windowManager.closeWindow(task.instance.id);
          }
        }
      });
    }

    return {
      items,
      position: { x, y },
      style: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        minHeight: ref.current.clientHeight
      }
    };
  }

  return (task: Task) => () => getTaskContextMenuDescriptor(task);
}
