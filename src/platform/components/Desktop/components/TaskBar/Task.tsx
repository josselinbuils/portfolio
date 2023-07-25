import cn from 'classnames';
import { type HTMLAttributes, type RefObject } from 'preact/compat';
import { forwardRef, useEffect, useState } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { WithTooltip } from '@/platform/components/Tooltip/WithTooltip';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { useMenu } from '@/platform/providers/MenuProvider/useMenu';
import { windowManager } from '@/platform/services/windowManager/windowManager';
import { noop } from '@/platform/utils/noop';
import styles from './Task.module.scss';
import { type TaskDescriptor } from './TaskDescriptor';
import { useTaskContextMenu } from './hooks/useTaskContextMenu';
import { useTaskRunner } from './hooks/useTaskRunner';
import { isAppTaskDescriptor } from './utils/isAppTaskDescriptor';

const LOADER_APPARITION_DELAY_MS = 200;

interface TaskProps extends HTMLAttributes<HTMLButtonElement> {
  taskButtonActive: boolean;
  taskDescriptor: TaskDescriptor;
}

export const Task = forwardRef<HTMLButtonElement, TaskProps>(
  (
    { onClick = noop, taskButtonActive, taskDescriptor, ...forwardedProps },
    ref,
  ) => {
    const taskRef = ref as unknown as RefObject<HTMLButtonElement>;
    const [loading, setLoading] = useState(false);
    const { hideMenu, isMenuDisplayed, showMenu } = useMenu();
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
        <p className={styles.tooltipBody}>{description}</p>
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
          aria-label={name}
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
            className={cn(styles.icon, { [styles.loading]: loading })}
            icon={icon}
            style={{ fontSize: `${iconScale}em` }}
          />
          {running && <div className={styles.runIndicator} />}
        </button>
      </WithTooltip>
    );
  },
);
