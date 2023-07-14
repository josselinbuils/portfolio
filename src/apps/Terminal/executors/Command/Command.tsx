import { type Executor } from '../Executor';
import styles from './Command.module.scss';

export const PREFIX_SIZE_CH = 4;

export const Command: Executor = ({ args }) => (
  <p className={styles.command}>
    <span>~</span>
    <span className={styles.separator}>{' > '}</span>
    <span>{args[0]}</span>
  </p>
);
