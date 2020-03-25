import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC, RefObject, useEffect, useRef, useState } from 'react';
import { AppDescriptor } from '~/apps/AppDescriptor';
import { useInjector } from '~/platform/hooks';
import { WithContextMenu } from '~/platform/providers/ContextMenuProvider';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';
import { useTaskContextMenu, useTaskRunner } from './hooks';

import styles from './Task.module.scss';

const LOADER_APPARITION_DELAY_MS = 200;

export const Task: FC<Props> = ({
  appDescriptor,
  taskBarRef,
  windowInstance
}) => {
  const taskRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const getTaskContextMenuDescriptor = useTaskContextMenu(
    appDescriptor,
    taskBarRef,
    taskRef,
    windowInstance
  );
  const run = useTaskRunner(appDescriptor, windowInstance);
  const windowManager = useInjector(WindowManager);
  const active = windowInstance && windowInstance.active;
  const running = !!windowInstance || loading;
  const { icon, iconScale = 1 } = appDescriptor;

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

  async function runTask(): Promise<void> {
    // Delay loader apparition to avoid displaying it when app already loaded
    const displayLoaderTimeout = setTimeout(
      () => setLoading(true),
      LOADER_APPARITION_DELAY_MS
    );
    await run();
    clearTimeout(displayLoaderTimeout);
    setLoading(false);
  }

  return (
    <WithContextMenu descriptor={getTaskContextMenuDescriptor}>
      <div
        className={cn(styles.task, { [styles.active]: active })}
        onClick={runTask}
        ref={taskRef}
      >
        <FontAwesomeIcon
          className={cn({ [styles.loading]: loading })}
          icon={icon}
          style={{ fontSize: `${iconScale}em` }}
        />
        {running && <div className={styles.runIndicator} />}
      </div>
    </WithContextMenu>
  );
};

interface Props {
  appDescriptor: AppDescriptor;
  taskBarRef: RefObject<HTMLDivElement>;
  windowInstance?: WindowInstance;
}
