import { type Executor } from '../Executor';
import classes from './Command.module.css';

export const PREFIX_SIZE_CH = 4;

export const Command: Executor = ({ args }) => (
  <p className={classes.command}>
    <span>~</span>
    <span className={classes.separator}>{' > '}</span>
    <span>{args[0]}</span>
  </p>
);
