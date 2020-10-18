import cn from 'classnames';
import { FC } from 'react';
import { APP_DESCRIPTORS } from '~/platform/appDescriptors';
import { useToolbar } from '~/platform/hooks/useToolbar';
import { useTaskDescriptors } from './hooks/useTaskDescriptors';
import { Task } from './Task';
import { getTaskId } from './utils/getTaskId';

import styles from './TaskBar.module.scss';

export const TaskBar: FC<Props> = ({ className }) => {
  const { getToolProps, toolbarProps } = useToolbar();
  const taskDescriptors = useTaskDescriptors(APP_DESCRIPTORS);

  return (
    <div className={cn(styles.taskBar, className)} {...toolbarProps}>
      {taskDescriptors.map((taskDescriptor, index) => {
        const { appDescriptor, windowInstance } = taskDescriptor;
        const id = getTaskId(taskDescriptor, index);

        return (
          <Task
            appDescriptor={appDescriptor}
            id={id}
            key={id}
            windowInstance={windowInstance}
            {...getToolProps(id)}
          />
        );
      })}
    </div>
  );
};

interface Props {
  className?: string;
}
