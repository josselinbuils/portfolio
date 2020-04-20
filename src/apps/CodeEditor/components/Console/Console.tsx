/* eslint-disable no-eval */
/* tslint:disable:no-eval */
import { faBomb } from '@fortawesome/free-solid-svg-icons/faBomb';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC, useState } from 'react';
import { Toolbar, ToolButton } from '~/apps/CodeEditor/components';
import { useKeyMap } from '~/platform/hooks';

import styles from './Console.module.scss';

export const Console: FC<Props> = ({ codeToExec, listenKeyboard }) => {
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  useKeyMap(
    {
      'Control+E,Meta+E': exec,
    },
    listenKeyboard
  );

  function exec(): void {
    setError('');
    setResult('');

    if (codeToExec) {
      try {
        setResult(eval(codeToExec) || 'undefined');
      } catch (error) {
        const position = error.stack.match(/(\d+:\d+)[^:]*$/m)[1];
        setError(`${error.stack.split('\n')[0]}\n    at ${position}`);
      }
    } else {
      setResult('No code to execute');
    }
  }

  return (
    <div className={styles.console}>
      <div className={styles.header}>Console</div>
      <Toolbar className={styles.toolbar}>
        <ToolButton icon={faPlay} onClick={exec} title="Execute" />
      </Toolbar>
      <div className={styles.logs}>
        {error ? (
          <>
            <span className={styles.errorMessage}>
              <FontAwesomeIcon icon={faBomb} /> {error.split('\n')[0]}
              {'\n'}
            </span>
            <span className={styles.errorStack}>
              {error.split('\n').slice(1).join('')}
            </span>
          </>
        ) : (
          result
        )}
      </div>
    </div>
  );
};

interface Props {
  codeToExec: string | undefined;
  listenKeyboard: boolean;
}
