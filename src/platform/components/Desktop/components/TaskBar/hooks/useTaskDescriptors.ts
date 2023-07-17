import { useEffect, useState } from 'preact/compat';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';
import { windowManager } from '@/platform/services/windowManager/windowManager';
import { type TaskDescriptor } from '../TaskDescriptor';

export function useTaskDescriptors(
  pinnedAppDescriptors: AppDescriptor[],
): TaskDescriptor[] {
  const [tasks, setTasks] = useState<TaskDescriptor[]>(() =>
    getTaskDescriptors(
      pinnedAppDescriptors,
      windowManager.getWindowInstances(),
    ),
  );

  useEffect(
    () =>
      windowManager.windowInstancesSubject.subscribe((windowInstances) =>
        setTasks(getTaskDescriptors(pinnedAppDescriptors, windowInstances)),
      ),
    [pinnedAppDescriptors],
  );

  return tasks;
}

function getTaskDescriptors(
  pinnedAppDescriptors: AppDescriptor[],
  windowInstances: WindowInstance[] = [],
): TaskDescriptor[] {
  const pinnedTaskDescriptors: TaskDescriptor[] = pinnedAppDescriptors.map(
    (appDescriptor) => ({ appDescriptor }),
  );
  const taskDescriptors = [...pinnedTaskDescriptors];

  windowInstances.forEach((windowInstance) => {
    const pinnedTaskDescriptor = pinnedTaskDescriptors.find(
      (task) => task.appDescriptor === windowInstance.appDescriptor,
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
