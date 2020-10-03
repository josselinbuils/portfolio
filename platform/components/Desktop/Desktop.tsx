import cn from 'classnames';
import { FC } from 'react';
import { TaskBar } from './components/TaskBar/TaskBar';
import { VisibleArea } from './components/VisibleArea/VisibleArea';

import styles from './Desktop.module.scss';

export const Desktop: FC<Props> = ({ className }) => (
  <div className={cn(styles.desktop, className)}>
    <TaskBar />
    <VisibleArea />
  </div>
);

interface Props {
  className?: string;
}
