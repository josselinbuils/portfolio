import { type FunctionComponent } from 'preact';

import { TaskBar } from './components/TaskBar/TaskBar';
import { VisibleArea } from './components/VisibleArea/VisibleArea';
import styles from './Desktop.module.scss';

export const Desktop: FunctionComponent = () => (
  <div className={styles.desktop}>
    <TaskBar className={styles.taskBar} />
    <VisibleArea />
  </div>
);
