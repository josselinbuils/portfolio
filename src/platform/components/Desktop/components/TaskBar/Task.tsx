import cn from 'classnames';
import { type HTMLAttributes, type RefObject } from 'preact/compat';
import { forwardRef, useEffect, useState } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { WithTooltip } from '@/platform/components/Tooltip/WithTooltip';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';
import { useContextMenu } from '@/platform/providers/ContextMenuProvider/useContextMenu';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';
import { windowManager } from '@/platform/services/windowManager/windowManager';
import { noop } from '@/platform/utils/noop';
import styles from './Task.module.scss';
import { useTaskContextMenu } from './hooks/useTaskContextMenu';
import { useTaskRunner } from './hooks/useTaskRunner';

const LOADER_APPARITION_DELAY_MS = 200;

interface TaskProps extends HTMLAttributes<HTMLButtonElement> {
  appDescriptor: AppDescriptor;
  taskButtonActive: boolean;
  windowInstance?: WindowInstance;
}

export const Task = forwardRef<HTMLButtonElement, TaskProps>(
  (
    {
      appDescriptor,
      onClick = noop,
      taskButtonActive,
      windowInstance,
      ...forwardedProps
    },
    ref,
  ) => {
    const taskRef = ref as unknown as RefObject<HTMLButtonElement>;
    const [loading, setLoading] = useState(false);
    const { hideContextMenu, isContextMenuDisplayed, showContextMenu } =
      useContextMenu();
    const getTaskContextMenuDescriptor = useTaskContextMenu(
      appDescriptor,
      taskRef,
      windowInstance,
    );
    const run = useTaskRunner(appDescriptor, windowInstance);

    const windowInstanceActive = windowInstance && windowInstance.active;
    const running = !!windowInstance || loading;
    const { icon, iconScale = 1 } = appDescriptor;

    useEffect(() => {
      if (taskRef.current !== null && windowInstance !== undefined) {
        const taskClientRect = taskRef.current.getBoundingClientRect();
        const y = Math.round(taskClientRect.top + taskClientRect.height / 3);
        windowManager.setMinimizedTopPosition(windowInstance.id, y);
      }
    }, [taskRef, windowInstance]);

    useKeyMap(
      {
        ArrowRight: () =>
          showContextMenu({
            ...getTaskContextMenuDescriptor(),
            makeFirstItemActive: true,
          }),
      },
      taskButtonActive,
    );

    useKeyMap(
      { ArrowLeft: hideContextMenu },
      taskButtonActive && isContextMenuDisplayed,
      2,
    );

    async function runTask(): Promise<void> {
      // Delay loader apparition to avoid displaying it when app already loaded
      const displayLoaderTimeout = setTimeout(
        () => setLoading(true),
        LOADER_APPARITION_DELAY_MS,
      );
      await run();
      clearTimeout(displayLoaderTimeout);
      setLoading(false);
    }

    const tooltip = (
      <>
        <header>{appDescriptor.name}</header>
        <p className={styles.tooltipBody}>{appDescriptor.description}</p>
      </>
    );

    return (
      <WithTooltip
        className={cn(styles.tooltip, {
          [styles.windowInstanceActive]: windowInstanceActive,
        })}
        title={tooltip}
      >
        <button
          aria-label={appDescriptor.name}
          className={cn(styles.task, {
            [styles.taskButtonActive]: taskButtonActive,
            [styles.windowInstanceActive]: windowInstanceActive,
          })}
          onClick={(event) => {
            runTask();
            onClick(event);
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            showContextMenu(getTaskContextMenuDescriptor());
          }}
          ref={taskRef}
          tabIndex={-1}
          type="button"
          {...forwardedProps}
        >
          <FontAwesomeIcon
            className={cn({ [styles.loading]: loading })}
            icon={icon}
            style={{ fontSize: `${iconScale}em` }}
          />
          {running && <div className={styles.runIndicator} />}
        </button>
      </WithTooltip>
    );
  },
);
