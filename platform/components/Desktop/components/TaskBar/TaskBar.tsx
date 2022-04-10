import cn from 'classnames';
import { FC } from 'react';
import { APP_DESCRIPTORS } from '~/platform/appDescriptors';
import { useToolbar } from '~/platform/hooks/useToolbar';
import { useTaskDescriptors } from './hooks/useTaskDescriptors';
import { Task } from './Task';
import { getTaskId } from './utils/getTaskId';

import styles from './TaskBar.module.scss';

interface Props {
  className?: string;
}

export const TaskBar: FC<Props> = ({ className }) => {
  const { getToolProps, isToolActive, toolbarProps } = useToolbar('vertical');
  const taskDescriptors = useTaskDescriptors(APP_DESCRIPTORS);
  const { className: toolbarClassName, ...otherToolbarProps } = toolbarProps;

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
    </div>
  );
};
