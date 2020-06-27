import cn from 'classnames';
import React, { FC, useRef } from 'react';
import { APP_DESCRIPTORS } from '~/platform/constants';
import { useTaskDescriptors } from './hooks/useTaskDescriptors';
import { Task } from './Task';
import { getTaskKey } from './utils/getTaskKey';

import styles from './TaskBar.module.scss';

export const TaskBar: FC<Props> = ({ className }) => {
  const taskBarRef = useRef(null);
  const taskDescriptors = useTaskDescriptors(APP_DESCRIPTORS);

  return (
    <div className={cn(styles.taskBar, className)} ref={taskBarRef}>
      {taskDescriptors.map(({ appDescriptor, windowInstance }, index) => (
        <Task
          appDescriptor={appDescriptor}
          taskBarRef={taskBarRef}
          key={getTaskKey(appDescriptor, windowInstance, index)}
          windowInstance={windowInstance}
        />
      ))}
    </div>
  );
};

interface Props {
  className?: string;
}
