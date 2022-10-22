import { faExpand } from '@fortawesome/free-solid-svg-icons/faExpand';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import { FC } from 'react';
import { APP_DESCRIPTORS } from '~/platform/appDescriptors';
import { useToolbar } from '~/platform/hooks/useToolbar';
import { Task } from './Task';
import taskStyles from './Task.module.scss';
import styles from './TaskBar.module.scss';
import { useTaskDescriptors } from './hooks/useTaskDescriptors';
import { getTaskId } from './utils/getTaskId';

interface Props {
  className?: string;
}

export const TaskBar: FC<Props> = ({ className }) => {
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
        className={taskStyles.task}
        onClick={toggleFullScreen}
        type="button"
      >
        <FontAwesomeIcon icon={faExpand} />
      </button>
    </div>
  );
};
