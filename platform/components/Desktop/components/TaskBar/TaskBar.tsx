import cn from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';
import { APP_DESCRIPTORS } from '~/platform/appDescriptors';
import { useKeyMap } from '~/platform/hooks/useKeyMap';
import { useTaskDescriptors } from './hooks/useTaskDescriptors';
import { Task } from './Task';
import { getTaskId } from './utils/getTaskId';

import styles from './TaskBar.module.scss';

export const TaskBar: FC<Props> = ({ className }) => {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const taskBarRef = useRef(null);
  const taskDescriptors = useTaskDescriptors(APP_DESCRIPTORS);

  useEffect(() => {
    if (activeIndex >= taskDescriptors.length) {
      setActiveIndex(taskDescriptors.length - 1);
    }
  }, [activeIndex, taskDescriptors.length]);

  useKeyMap(
    {
      ArrowDown: () =>
        setActiveIndex(
          activeIndex < taskDescriptors.length - 1 ? activeIndex + 1 : 0
        ),
      ArrowUp: () =>
        setActiveIndex(
          activeIndex > 0 ? activeIndex - 1 : taskDescriptors.length - 1
        ),
    },
    focused
  );

  return (
    <div
      aria-activedescendant={
        // taskDescriptors[activeIndex] can be undefined if a window is closed
        focused && taskDescriptors[activeIndex]
          ? getTaskId(taskDescriptors[activeIndex], activeIndex)
          : undefined
      }
      className={cn(styles.taskBar, className)}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      ref={taskBarRef}
      role="toolbar"
      tabIndex={0}
    >
      {taskDescriptors.map((taskDescriptor, index) => {
        const { appDescriptor, windowInstance } = taskDescriptor;
        const id = getTaskId(taskDescriptor, index);

        return (
          <Task
            appDescriptor={appDescriptor}
            id={id}
            key={id}
            onClick={() => setFocused(false)}
            onMouseEnter={() => setActiveIndex(index)}
            taskBarRef={taskBarRef}
            taskButtonActive={focused && index === activeIndex}
            windowInstance={windowInstance}
          />
        );
      })}
    </div>
  );
};

interface Props {
  className?: string;
}
