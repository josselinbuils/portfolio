import { type Executor } from '../Executor';
import classes from './Help.module.css';

const commands = [
  ['bm', 'build manager'],
  ['clear', 'clear the terminal'],
  ['open', 'open an application'],
];

export const Help: Executor = () => (
  <div className={classes.help}>
    <p>Available commands:</p>
    {commands.map(([command, description]) => (
      <p key={command}>
        <span className={classes.command}>- {command}</span>
        <span className={classes.description}>{description}</span>
      </p>
    ))}
  </div>
);
