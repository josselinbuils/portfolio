import { useEffect, useState } from 'react';
import { WindowComponent } from '~/platform/components/Window';
import { useInjector } from '~/platform/hooks';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';
import { TaskDescriptor } from '../TaskDescriptor';

export function useTaskDescriptors(
  pinnedWindowComponents: WindowComponent[]
): TaskDescriptor[] {
  const [tasks, setTasks] = useState<TaskDescriptor[]>(() =>
    getTaskDescriptors(pinnedWindowComponents)
  );
  const windowManager = useInjector(WindowManager);

  useEffect(
    () =>
      windowManager.windowInstancesSubject.subscribe(windowInstances =>
        setTasks(getTaskDescriptors(pinnedWindowComponents, windowInstances))
      ),
    [pinnedWindowComponents, windowManager]
  );

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
