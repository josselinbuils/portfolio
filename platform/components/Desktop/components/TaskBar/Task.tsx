import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useKeyMap } from '@josselinbuils/hooks/useKeyMap';
import cn from 'classnames';
import {
  ButtonHTMLAttributes,
  FC,
  forwardRef,
  RefObject,
  useEffect,
  useState,
} from 'react';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider/useContextMenu';
import { useInjector } from '~/platform/providers/InjectorProvider/useInjector';
import { WithTooltip } from '~/platform/providers/TooltipProvider/WithTooltip';
import { WindowManager } from '~/platform/services/WindowManager/WindowManager';
import { WindowInstance } from '~/platform/services/WindowManager/WindowInstance';
import { noop } from '~/platform/utils/noop';
import { useTaskContextMenu } from './hooks/useTaskContextMenu';
import { useTaskRunner } from './hooks/useTaskRunner';

import styles from './Task.module.scss';

const LOADER_APPARITION_DELAY_MS = 200;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  appDescriptor: AppDescriptor;
  taskButtonActive: boolean;
  windowInstance?: WindowInstance;
}

export const Task: FC<Props> = forwardRef(
  (
    {
      appDescriptor,
      onClick = noop,
      taskButtonActive,
      windowInstance,
      ...forwardedProps
    },
    ref
  ) => {
    const taskRef = ref as unknown as RefObject<HTMLButtonElement>;
    const [loading, setLoading] = useState(false);
    const { hideContextMenu, isContextMenuDisplayed, showContextMenu } =
      useContextMenu();
    const getTaskContextMenuDescriptor = useTaskContextMenu(
      appDescriptor,
      taskRef,
      windowInstance
    );
    const run = useTaskRunner(appDescriptor, windowInstance);
    const windowManager = useInjector(WindowManager);
    const windowInstanceActive = windowInstance && windowInstance.active;
    const running = !!windowInstance || loading;
    const { icon, iconScale = 1, isMobileFriendly } = appDescriptor;

    useEffect(() => {
      if (taskRef.current !== null && windowInstance !== undefined) {
        const taskClientRect = taskRef.current.getBoundingClientRect();
        const y = Math.round(taskClientRect.top + taskClientRect.height / 3);
        windowManager.setMinimizedTopPosition(windowInstance.id, y);
      }
    }, [taskRef, windowInstance, windowManager]);

    useKeyMap(
      {
        ArrowRight: () =>
          showContextMenu({
            ...getTaskContextMenuDescriptor(),
            makeFirstItemActive: true,
          }),
      },
      taskButtonActive
    );

    useKeyMap(
      { ArrowLeft: hideContextMenu },
      taskButtonActive && isContextMenuDisplayed,
      2
    );

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

    const tooltip = (
      <>
        <header>{appDescriptor.name}</header>
        <p className={styles.tooltipBody}>{appDescriptor.description}</p>
      </>
    );

    return (
      <WithTooltip className={styles.tooltip} title={tooltip}>
        <button
          className={cn(styles.task, {
            [styles.notMobileFriendly]: !isMobileFriendly,
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
  }
);
