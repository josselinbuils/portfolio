import { ElementType, useEffect, useState } from 'react';
import { useWindowManager } from '~/platform/providers/WindowProvider';
import { addNewTasks, removeOutdatedTasks } from '../utils';
import { Task } from '../Task';

export function useTasks(defaultComponents: ElementType[]): Task[] {
  const [tasks, setTasks] = useState<Task[]>(
    defaultComponents.map(component => new Task(component, true))
  );
  const windowManager = useWindowManager();

  useEffect(() => {
    return windowManager.windowInstancesSubject.subscribe(windowInstances => {
      setTasks(tasks => {
        const cleanedTasks = removeOutdatedTasks(windowInstances, [...tasks]);
        return addNewTasks(windowInstances, cleanedTasks);
      });
    });
  }, [windowManager]);

  return tasks;
}
