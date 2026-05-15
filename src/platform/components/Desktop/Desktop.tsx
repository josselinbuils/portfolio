import { type FunctionComponent } from 'preact';

import { TaskBar } from './components/TaskBar/TaskBar';
import { VisibleArea } from './components/VisibleArea/VisibleArea';
import classes from './Desktop.module.css';

export const Desktop: FunctionComponent = () => (
  <div className={classes.desktop}>
    <TaskBar className={classes.taskBar} />
    <VisibleArea />
  </div>
);
