import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { type RefObject } from 'preact';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import {
  type MenuDescriptor,
  type MenuItemDescriptor,
} from '@/platform/components/Menu/Menu';
import { windowManager } from '@/platform/services/windowManager/windowManager';

import styles from '../Task.module.css';
import { type TaskDescriptor } from '../TaskDescriptor';
import { isAppTaskDescriptor } from '../utils/isAppTaskDescriptor';

const BORDER_RADIUS_MARGIN_PX = 6;

export function useTaskContextMenu(
  taskDescriptor: TaskDescriptor,
  taskRef: RefObject<HTMLElement>,
): () => MenuDescriptor | undefined {
  return function getTaskMenuDescriptor() {
    if (!isAppTaskDescriptor(taskDescriptor)) {
      return undefined;
    }

    if (taskRef.current === null) {
      throw new Error('Unable to retrieve task html element');
    }

    const { icon, name, windowInstance } = taskDescriptor;
    const { right: x, y } = taskRef.current.getBoundingClientRect();
    const items: MenuItemDescriptor[] = [
      {
        onClick: () => windowManager.openApp(taskDescriptor),
        title: (
          <>
            <div className={styles.contextMenuIcon}>
              <FontAwesomeIcon icon={icon} />
            </div>
            {name}
          </>
        ),
      },
    ];

    if (windowInstance !== undefined) {
      items.push({
        onClick: () => windowManager.closeWindow(windowInstance.id),
        title: (
          <>
            <div className={styles.contextMenuIcon}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
            Close
          </>
        ),
      });
    }

    return {
      className: styles.contextMenu,
      items,
      position: { x, y },
      style: {
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
        marginLeft: -BORDER_RADIUS_MARGIN_PX,
        minHeight: taskRef.current.clientHeight,
        paddingLeft: BORDER_RADIUS_MARGIN_PX,
      },
    };
  };
}
