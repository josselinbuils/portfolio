import cn from 'classnames';
import React, { FC, useEffect, useRef } from 'react';
import { Notes } from '~/apps/Notes';
import { useWindowManager } from '~/platform/providers/WindowProvider';
import { WithContextMenu } from '~/platform/providers/ContextMenuProvider';
import { useDescriptorFactory, useTaskRunner, useTasks } from './hooks';
import { isTaskActive } from './utils';
import styles from './TaskBar.module.scss';

export const TaskBar: FC = () => {
  const tasks = useTasks([Notes]);
  const windowManager = useWindowManager();
  const taskBarRef = useRef(null);
  const descriptorFactory = useDescriptorFactory(taskBarRef);
  const run = useTaskRunner();

  useEffect(() => windowManager.openWindow(Notes), [windowManager]);

  return (
    <div className={styles.taskBar} ref={taskBarRef}>
      {tasks.map(task => (
        <WithContextMenu descriptor={descriptorFactory(task)} key={task.id}>
          <div
            className={cn(styles.task, { [styles.active]: isTaskActive(task) })}
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
