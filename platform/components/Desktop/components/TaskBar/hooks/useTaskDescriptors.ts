import { useEffect, useState } from 'react';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';
import { useInjector } from '~/platform/providers/InjectorProvider/useInjector';
import { WindowManager } from '~/platform/services/WindowManager/WindowManager';
import { WindowInstance } from '~/platform/services/WindowManager/WindowInstance';
import { TaskDescriptor } from '../TaskDescriptor';

export function useTaskDescriptors(
  pinnedAppDescriptors: AppDescriptor[]
): TaskDescriptor[] {
  const windowManager = useInjector(WindowManager);
  const [tasks, setTasks] = useState<TaskDescriptor[]>(() =>
    getTaskDescriptors(pinnedAppDescriptors, windowManager.getWindowInstances())
  );

  useEffect(
    () =>
      windowManager.windowInstancesSubject.subscribe((windowInstances) =>
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
    (appDescriptor) => ({ appDescriptor })
  );
  const taskDescriptors = [...pinnedTaskDescriptors];

  windowInstances.forEach((windowInstance) => {
    const pinnedTaskDescriptor = pinnedTaskDescriptors.find(
      (task) => task.appDescriptor === windowInstance.appDescriptor
    );

    if (
      pinnedTaskDescriptor !== undefined &&
      pinnedTaskDescriptor.windowInstance === undefined
    ) {
      pinnedTaskDescriptor.windowInstance = windowInstance;
    } else {
      const { appDescriptor } = windowInstance;

      taskDescriptors.push({
        appDescriptor,
        windowInstance,
      });
    }
  });

  return taskDescriptors;
}
