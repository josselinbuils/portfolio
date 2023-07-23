import { useEffect, useState } from 'preact/compat';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';
import { windowManager } from '@/platform/services/windowManager/windowManager';
import { type AppTaskDescriptor } from '../TaskDescriptor';

export function useAppTaskDescriptors(
  pinnedAppDescriptors: AppDescriptor[],
): AppTaskDescriptor[] {
  const [tasks, setTasks] = useState<AppTaskDescriptor[]>(() =>
    getAppTaskDescriptors(
      pinnedAppDescriptors,
      windowManager.getWindowInstances(),
    ),
  );

  useEffect(
    () =>
      windowManager.windowInstancesSubject.subscribe((windowInstances) => {
        setTasks(getAppTaskDescriptors(pinnedAppDescriptors, windowInstances));
      }),
    [pinnedAppDescriptors],
  );

  return tasks;
}

function getAppTaskDescriptors(
  pinnedAppDescriptors: AppDescriptor[],
  windowInstances: WindowInstance[] = [],
): AppTaskDescriptor[] {
  const taskDescriptors: AppTaskDescriptor[] = pinnedAppDescriptors
    .slice()
    .map((appDescriptor) => ({ ...appDescriptor }));

  windowInstances.forEach((windowInstance) => {
    const pinnedTaskDescriptor = taskDescriptors.find(
      (task) => task.name === windowInstance.appDescriptor.name,
    );

    if (
      pinnedTaskDescriptor !== undefined &&
      pinnedTaskDescriptor.windowInstance === undefined
    ) {
      pinnedTaskDescriptor.windowInstance = windowInstance;
    } else {
      const { appDescriptor } = windowInstance;

      taskDescriptors.push({
        ...appDescriptor,
        windowInstance,
      });
    }
  });

  return taskDescriptors;
}
