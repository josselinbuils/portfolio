import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { type RefObject } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { type ContextMenuDescriptor } from '@/platform/providers/ContextMenuProvider/ContextMenuDescriptor';
import { type ContextMenuItemDescriptor } from '@/platform/providers/ContextMenuProvider/ContextMenuItemDescriptor';
import { windowManager } from '@/platform/services/windowManager/windowManager';
import styles from '../Task.module.scss';
import { type TaskDescriptor } from '../TaskDescriptor';
import { isAppTaskDescriptor } from '../utils/isAppTaskDescriptor';

const BORDER_RADIUS_MARGIN_PX = 6;

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
        title: (
          <>
            <div className={styles.contextMenuIcon}>
              <FontAwesomeIcon icon={icon} />
            </div>
            {name}
          </>
        ),
        onClick: () => windowManager.openApp(taskDescriptor),
      },
    ];

    if (windowInstance !== undefined) {
      items.push({
        title: (
          <>
            <div className={styles.contextMenuIcon}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
            Close
          </>
        ),
        onClick: () => windowManager.closeWindow(windowInstance.id),
      });
    }

    return {
      className: styles.contextMenu,
      items,
      position: { x, y },
      style: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        marginLeft: -BORDER_RADIUS_MARGIN_PX,
        minHeight: taskRef.current.clientHeight,
        paddingLeft: BORDER_RADIUS_MARGIN_PX,
      },
    };
  };
}
