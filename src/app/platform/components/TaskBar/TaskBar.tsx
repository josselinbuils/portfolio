import cn from 'classnames';
import React, { FC, useEffect, useRef } from 'react';
import { Notes } from '~/apps/Notes';
import { useWindowManager } from '~/platform/providers/WindowProvider';
import { Task } from './Task';
import { WithContextMenu } from '~/platform/providers/ContextMenuProvider';
import { useDescriptorFactory, useTaskRunner, useTasks } from './hooks';
import { isTaskActive } from './utils';
import styles from './TaskBar.module.scss';

export const TaskBar: FC = () => {
  const tasks = useTasks([new Task(Notes, true)]);
  const windowManager = useWindowManager();
  const taskBarRef = useRef(null);
  const descriptorFactory = useDescriptorFactory(taskBarRef);
  const run = useTaskRunner();

  useEffect(() => windowManager.openWindow(Notes), [windowManager]);

  return (
    <div className={styles.taskBar} ref={taskBarRef}>
      {tasks.map(task => (
        <WithContextMenu descriptor={descriptorFactory(task)}>
          <div
            className={cn(styles.task, { [styles.active]: isTaskActive(task) })}
            key={task.id}
            onClick={() => run(task)}
            ref={task.ref}
          >
            <i className={task.iconClass} />
            {task.instance && <div className={styles.runIndicator} />}
          </div>
        </WithContextMenu>
      ))}
    </div>
  );
};
