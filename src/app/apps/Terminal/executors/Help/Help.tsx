import React from 'react';
import { Executor, ExecutorType } from '../executor';
import styles from './Help.module.scss';

const commands = [
  ['bm', 'build manager'],
  ['open', 'open an application'],
  ['projects', 'show my GitHub projects'],
  ['skills', 'show my main skills'],
  ['work', 'show my work experience']
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

Help.type = ExecutorType.Sync;
