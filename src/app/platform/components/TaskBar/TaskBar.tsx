import React, { FC, useRef } from 'react';
import { Notes, Teravia, Terminal } from '~/apps';
import { useTaskDescriptors } from './hooks';
import { Task } from './Task';
import { getTaskKey } from './utils';
import styles from './TaskBar.module.scss';

// Has to be in a constant to avoid useless recurrent computations
const PINNED_WINDOW_COMPONENTS = [Terminal, Teravia, Notes];

export const TaskBar: FC = () => {
  const taskBarRef = useRef(null);
  const taskDescriptors = useTaskDescriptors(PINNED_WINDOW_COMPONENTS);

  return (
    <div className={styles.taskBar} ref={taskBarRef}>
      {taskDescriptors.map(({ windowComponent, windowInstance }, index) => (
        <Task
          taskBarRef={taskBarRef}
          key={getTaskKey(windowComponent, windowInstance, index)}
          windowComponent={windowComponent}
          windowInstance={windowInstance}
        />
      ))}
    </div>
  );
};
