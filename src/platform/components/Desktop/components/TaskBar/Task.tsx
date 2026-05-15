import cn from 'classnames';
import { type HTMLAttributes, type RefObject } from 'preact';
import { forwardRef } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { useMenu } from '@/platform/components/Menu/useMenu';
import { WithTooltip } from '@/platform/components/Tooltip/WithTooltip';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { windowManager } from '@/platform/services/windowManager/windowManager';
import { noop } from '@/platform/utils/noop';

import { useTaskContextMenu } from './hooks/useTaskContextMenu';
import { useTaskRunner } from './hooks/useTaskRunner';
import classes from './Task.module.css';
import { type TaskDescriptor } from './TaskDescriptor';
import { isAppTaskDescriptor } from './utils/isAppTaskDescriptor';

const LOADER_APPARITION_DELAY_MS = 200;

type TaskProps = HTMLAttributes<HTMLButtonElement> & {
  taskButtonActive: boolean;
  taskDescriptor: TaskDescriptor;
};

export const Task = forwardRef<HTMLButtonElement, TaskProps>(
  (
    { onClick = noop, taskButtonActive, taskDescriptor, ...forwardedProps },
    ref,
  ) => {
    const taskRef = ref as unknown as RefObject<HTMLButtonElement>;
    const [loading, setLoading] = useState(false);
    const { hideMenu, isMenuDisplayed, menuElement, showMenu } = useMenu();
    const getTaskMenuDescriptor = useTaskContextMenu(taskDescriptor, taskRef);
    const run = useTaskRunner(taskDescriptor);

    const { description, icon, iconScale = 1, name } = taskDescriptor;

    const windowInstance = isAppTaskDescriptor(taskDescriptor)
      ? taskDescriptor.windowInstance
      : undefined;
    const windowInstanceActive = windowInstance && windowInstance.active;
    const running = !!windowInstance || loading;

    useEffect(() => {
      if (taskRef.current !== null && windowInstance !== undefined) {
        const taskClientRect = taskRef.current.getBoundingClientRect();
        const y = Math.round(taskClientRect.top + taskClientRect.height / 3);
        windowManager.setMinimizedTopPosition(windowInstance.id, y);
      }
    }, [taskRef, windowInstance]);

    useKeyMap(
      {
        ArrowRight: () => {
          const taskMenuDescriptor = getTaskMenuDescriptor();

          if (taskMenuDescriptor !== undefined) {
            showMenu({
              ...taskMenuDescriptor,
              makeFirstItemActive: true,
            });
          }
        },
      },
      taskButtonActive,
    );

    useKeyMap({ ArrowLeft: hideMenu }, taskButtonActive && isMenuDisplayed, 2);

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
        <header>{name}</header>
        <p className={classes.tooltipBody}>{description}</p>
      </>
    );

    return (
      <WithTooltip
        className={cn(classes.tooltip, {
          [classes.windowInstanceActive]: windowInstanceActive,
        })}
        title={tooltip}
      >
        <button
          aria-label={name}
          className={cn(classes.task, {
            [classes.taskButtonActive]: taskButtonActive && !isMenuDisplayed,
            [classes.windowInstanceActive]:
              windowInstanceActive && !isMenuDisplayed,
          })}
          onClick={(event) => {
            runTask();
            onClick(event);
          }}
          onContextMenu={(event) => {
            event.preventDefault();

            const taskMenuDescriptor = getTaskMenuDescriptor();

            if (taskMenuDescriptor !== undefined) {
              showMenu(taskMenuDescriptor);
            }
          }}
          ref={taskRef}
          tabIndex={-1}
          type="button"
          {...forwardedProps}
        >
          <FontAwesomeIcon
            className={cn(classes.icon, { [classes.loading]: loading })}
            icon={icon}
            style={{ fontSize: `${iconScale}em` }}
          />
          {running && <div className={classes.runIndicator} />}
          {menuElement}
        </button>
      </WithTooltip>
    );
  },
);
