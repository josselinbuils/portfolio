import { faExpand } from '@fortawesome/free-solid-svg-icons/faExpand';
import cn from 'classnames';
import { type FC } from 'preact/compat';
import { APP_DESCRIPTORS } from '@/platform/appDescriptors';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon';
import { useToolbar } from '@/platform/hooks/useToolbar';
import { Task } from './Task';
import taskStyles from './Task.module.scss';
import styles from './TaskBar.module.scss';
import { useTaskDescriptors } from './hooks/useTaskDescriptors';
import { getTaskId } from './utils/getTaskId';

export interface TaskBarProps {
  className?: string;
}

export const TaskBar: FC<TaskBarProps> = ({ className }) => {
  const { getToolProps, isToolActive, toolbarProps } = useToolbar('vertical');
  const taskDescriptors = useTaskDescriptors(APP_DESCRIPTORS);
  const { className: toolbarClassName, ...otherToolbarProps } = toolbarProps;

  async function toggleFullScreen(): Promise<void> {
    if (!document.fullscreenElement) {
      await document.documentElement?.requestFullscreen();
    } else {
      await document?.exitFullscreen();
    }
  }

  return (
    <div
      className={cn(styles.taskBar, className, toolbarClassName)}
      {...otherToolbarProps}
    >
      {taskDescriptors.map((taskDescriptor, index) => {
        const { appDescriptor, windowInstance } = taskDescriptor;
        const id = getTaskId(taskDescriptor, index);

        return (
          <Task
            appDescriptor={appDescriptor}
            id={id}
            key={id}
            taskButtonActive={isToolActive(id)}
            windowInstance={windowInstance}
            {...getToolProps(id)}
          />
        );
      })}
      <button
        aria-label="toggle full screen"
        className={taskStyles.task}
        onClick={toggleFullScreen}
        type="button"
      >
        <FontAwesomeIcon icon={faExpand} />
      </button>
    </div>
  );
};
