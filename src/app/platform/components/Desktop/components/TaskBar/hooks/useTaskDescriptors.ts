import { useEffect, useState } from 'react';
import { AppDescriptor } from '~/apps/AppDescriptor';
import { useInjector } from '~/platform/hooks';
import {
  WindowInstance,
  WindowManager
} from '~/platform/services/WindowManager';
import { TaskDescriptor } from '../TaskDescriptor';

export function useTaskDescriptors(
  pinnedAppDescriptors: AppDescriptor[]
): TaskDescriptor[] {
  const [tasks, setTasks] = useState<TaskDescriptor[]>(() =>
    getTaskDescriptors(pinnedAppDescriptors)
  );
  const windowManager = useInjector(WindowManager);

  useEffect(
    () =>
      windowManager.windowInstancesSubject.subscribe(windowInstances =>
        setTasks(getTaskDescriptors(pinnedAppDescriptors, windowInstances))
      ),
    [pinnedAppDescriptors, windowManager]
  );

  return tasks;
}

function getTaskDescriptors(
  pinnedAppDescriptors: AppDescriptor[],
  windowInstances: WindowInstance[] = []
): TaskDescriptor[] {
  const pinnedTaskDescriptors: TaskDescriptor[] = pinnedAppDescriptors.map(
    appDescriptor => ({ appDescriptor })
  );
  const taskDescriptors = [...pinnedTaskDescriptors];

  windowInstances.forEach(windowInstance => {
    const pinnedTaskDescriptor = pinnedTaskDescriptors.find(
      task =>
        task.appDescriptor === windowInstance.windowComponent.appDescriptor
    );

    if (
      pinnedTaskDescriptor !== undefined &&
      pinnedTaskDescriptor.windowInstance === undefined
    ) {
      pinnedTaskDescriptor.windowInstance = windowInstance;
    } else {
      const { appDescriptor } = windowInstance.windowComponent;

      taskDescriptors.push({
        appDescriptor,
        windowInstance
      });
    }
  });

  return taskDescriptors;
}
