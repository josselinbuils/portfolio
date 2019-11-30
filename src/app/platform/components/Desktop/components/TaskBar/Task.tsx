import cn from 'classnames';
import React, { FC, RefObject, useEffect, useRef } from 'react';
import { AppDescriptor } from '~/apps/AppDescriptor';
import { useInjector } from '~/platform/hooks';
import { WithContextMenu } from '~/platform/providers/ContextMenuProvider';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';
import { useTaskContextMenu, useTaskRunner } from './hooks';
import styles from './Task.module.scss';

export const Task: FC<Props> = ({
  appDescriptor,
  taskBarRef,
  windowInstance
}) => {
  const taskRef = useRef<HTMLDivElement>(null);
  const getTaskContextMenuDescriptor = useTaskContextMenu(
    appDescriptor,
    taskBarRef,
    taskRef,
    windowInstance
  );
  const run = useTaskRunner(appDescriptor, windowInstance);
  const windowManager = useInjector(WindowManager);
  const active = windowInstance && windowInstance.active;
  const { iconClass } = appDescriptor;
  const iconClassName = cn(iconClass, styles[iconClass.split(' ')[1]]);

  useEffect(() => {
    if (
      taskBarRef.current !== null &&
      taskRef.current !== null &&
      windowInstance !== undefined
    ) {
      const taskClientRect = taskRef.current.getBoundingClientRect();
      const y = Math.round(taskClientRect.top + taskClientRect.height / 3);
      windowManager.setMinimizedTopPosition(windowInstance.id, y);
    }
  }, [taskBarRef, windowInstance, windowManager]);

  return (
    <WithContextMenu descriptor={getTaskContextMenuDescriptor}>
      <div
        className={cn(styles.task, { [styles.active]: active })}
        onClick={run}
        ref={taskRef}
      >
        <i className={iconClassName} />
        {windowInstance && <div className={styles.runIndicator} />}
      </div>
    </WithContextMenu>
  );
};

interface Props {
  appDescriptor: AppDescriptor;
  taskBarRef: RefObject<HTMLDivElement>;
  windowInstance?: WindowInstance;
}
