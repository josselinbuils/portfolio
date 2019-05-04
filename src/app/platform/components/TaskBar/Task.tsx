import cn from 'classnames';
import React, { FC, RefObject, useRef } from 'react';
import { WithContextMenu } from '~/platform/providers/ContextMenuProvider';
import {
  WindowComponent,
  WindowInstance
} from '~/platform/providers/WindowProvider';
import { useTaskContextMenu, useTaskRunner } from './hooks';
import styles from './Task.module.scss';

export const Task: FC<Props> = ({
  taskBarRef,
  windowInstance,
  windowComponent
}) => {
  const taskRef = useRef(null);
  const getTaskContextMenuDescriptor = useTaskContextMenu(
    taskBarRef,
    taskRef,
    windowComponent,
    windowInstance
  );
  const run = useTaskRunner(windowComponent, windowInstance);
  const active = windowInstance && windowInstance.active;

  return (
    <WithContextMenu descriptor={getTaskContextMenuDescriptor}>
      <div
        className={cn(styles.task, { [styles.active]: active })}
        onClick={run}
        ref={taskRef}
      >
        <i className={windowComponent.iconClass} />
        {windowInstance && <div className={styles.runIndicator} />}
      </div>
    </WithContextMenu>
  );
};

interface Props {
  taskBarRef: RefObject<HTMLDivElement>;
  windowComponent: WindowComponent;
  windowInstance?: WindowInstance;
}
