import React from 'react';
import { Executor, ExecutorType } from '../executor';
import styles from './BashError.module.scss';

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
  'who'
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
    <p className={styles.error}>
      -bash: {command}: {errorMessage}
    </p>
  );
};

BashError.type = ExecutorType.Sync;
