import { useEffect, useState } from 'react';
import { useWindowManager } from '~/platform/providers/WindowProvider';
import { addNewTasks, removeOutdatedTasks } from '../utils';
import { Task } from '../Task';

export function useTasks(defaultTasks: Task[]): Task[] {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const windowManager = useWindowManager();

  useEffect(() => {
    windowManager.windowInstancesSubject.subscribe(windowInstances => {
      setTasks(tasks => {
        const cleanedTasks = removeOutdatedTasks(windowInstances, [...tasks]);
        return addNewTasks(windowInstances, cleanedTasks);
      });
    });
  }, [windowManager]);

  return tasks;
}
