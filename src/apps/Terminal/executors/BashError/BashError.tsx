import { type Executor } from '../Executor';
import classes from './BashError.module.css';

const COMMANDS = [
  'cat',
  'cd',
  'chmod',
  'chown',
  'cp',
  'kill',
  'locate',
  'ls',
  'man',
  'mkdir',
  'mv',
  'passwd',
  'pwd',
  'rm',
  'rmdir',
  'ssh',
  'su',
  'sudo',
  'touch',
  'whereis',
  'who',
];

export const BashError: Executor = ({ args }) => {
  const command = args[0];
  let errorMessage = args[1];

  if (errorMessage === undefined) {
    errorMessage =
      COMMANDS.indexOf(command) !== -1
        ? 'Permission denied'
        : 'command not found';
  }

  return (
    <p className={classes.error}>
      zsh: {command}: {errorMessage}
    </p>
  );
};
