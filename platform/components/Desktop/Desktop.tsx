import type { FC } from 'react';
import styles from './Desktop.module.scss';
import { TaskBar } from './components/TaskBar/TaskBar';
import { VisibleArea } from './components/VisibleArea/VisibleArea';

export const Desktop: FC = () => (
  <div className={styles.desktop}>
    <TaskBar className={styles.taskBar} />
    <VisibleArea />
  </div>
);
