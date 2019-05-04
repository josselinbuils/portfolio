import { useEffect, useState } from 'react';
import {
  useWindowManager,
  WindowComponent,
  WindowInstance
} from '~/platform/providers/WindowProvider';
import { TaskDescriptor } from '../TaskDescriptor';

export function useTaskDescriptors(
  pinnedWindowComponents: WindowComponent[]
): TaskDescriptor[] {
  const [tasks, setTasks] = useState<TaskDescriptor[]>(() =>
    getTaskDescriptors(pinnedWindowComponents)
  );
  const windowManager = useWindowManager();

  useEffect(() => {
    return windowManager.windowInstancesSubject.subscribe(windowInstances => {
      setTasks(getTaskDescriptors(pinnedWindowComponents, windowInstances));
    });
  }, [pinnedWindowComponents, windowManager]);

  return tasks;
}

function getTaskDescriptors(
  pinnedWindowComponents: WindowComponent[],
  windowInstances: WindowInstance[] = []
): TaskDescriptor[] {
  const pinnedTaskDescriptors: TaskDescriptor[] = pinnedWindowComponents.map(
    windowComponent => ({ windowComponent })
  );
  const taskDescriptors = [...pinnedTaskDescriptors];

  windowInstances.forEach(windowInstance => {
    const pinnedTaskDescriptor = pinnedTaskDescriptors.find(
      task => task.windowComponent === windowInstance.windowComponent
    );

    if (
      pinnedTaskDescriptor !== undefined &&
      pinnedTaskDescriptor.windowInstance === undefined
    ) {
      pinnedTaskDescriptor.windowInstance = windowInstance;
    } else {
      // windowInstance is optional so we have to provide windowComponent
      taskDescriptors.push({
        windowComponent: windowInstance.windowComponent,
        windowInstance
      });
    }
  });

  return taskDescriptors;
}
