import { FC } from 'react';
import { TaskBar } from './components/TaskBar/TaskBar';
import { VisibleArea } from './components/VisibleArea/VisibleArea';

import styles from './Desktop.module.scss';

export const Desktop: FC = () => {
  return (
    <div className={styles.desktop}>
      <TaskBar />
      <VisibleArea />
    </div>
  );
};
