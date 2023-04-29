import type { Executor } from '../Executor';
import styles from './Help.module.scss';

const commands = [
  ['bm', 'build manager'],
  ['clear', 'clear the terminal'],
  ['open', 'open an application'],
];

export const Help: Executor = () => (
  <div className={styles.help}>
    <p>Available commands:</p>
    {commands.map(([command, description]) => (
      <p key={command}>
        <span className={styles.command}>- {command}</span>
        <span className={styles.description}>{description}</span>
      </p>
    ))}
  </div>
);
