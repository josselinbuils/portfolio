import { faExpand } from '@fortawesome/free-solid-svg-icons/faExpand';
import cn from 'classnames';
import { type FC } from 'preact/compat';
import { APP_DESCRIPTORS } from '@/platform/appDescriptors';
import { useToolbar } from '@/platform/hooks/useToolbar';
import { Task } from './Task';
import styles from './TaskBar.module.scss';
import { useAppTaskDescriptors } from './hooks/useAppTaskDescriptors';
import { getTaskId } from './utils/getTaskId';

const PINNED_ACTION_TASK_DESCRIPTORS = [
  {
    async action() {
      if (!document.fullscreenElement) {
        await document.documentElement?.requestFullscreen();
      } else {
        await document?.exitFullscreen();
      }
    },
    description: 'Maximize or unmaximize the app.',
    icon: faExpand,
    name: 'Toggle fullscreen',
  },
];

export interface TaskBarProps {
  className?: string;
}

export const TaskBar: FC<TaskBarProps> = ({ className }) => {
  const { getToolProps, isToolActive, toolbarProps } = useToolbar('vertical');
  const taskDescriptors = useAppTaskDescriptors(APP_DESCRIPTORS);
  const { className: toolbarClassName, ...otherToolbarProps } = toolbarProps;

  return (
    <div
      className={cn(styles.taskBar, className, toolbarClassName)}
      {...otherToolbarProps}
    >
      {[...taskDescriptors, ...PINNED_ACTION_TASK_DESCRIPTORS].map(
        (taskDescriptor, index) => {
          const id = getTaskId(taskDescriptor, index);

          return (
            <Task
              id={id}
              key={id}
              taskButtonActive={isToolActive(id)}
              taskDescriptor={taskDescriptor}
              {...getToolProps(id)}
            />
          );
        },
      )}
    </div>
  );
};
