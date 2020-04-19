/* eslint-disable no-eval */
/* tslint:disable:no-eval */
import { faBomb } from '@fortawesome/free-solid-svg-icons/faBomb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC, useLayoutEffect, useState } from 'react';

import styles from './Console.module.scss';

export const Console: FC<Props> = ({ codeToExec }) => {
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  useLayoutEffect(() => {
    setError('');
    setResult('');

    if (codeToExec !== undefined) {
      try {
        setResult(eval(codeToExec));
      } catch (error) {
        const position = error.stack.match(/(\d+:\d+)[^:]*$/m)[1];
        setError(`${error.stack.split('\n')[0]}\n    at ${position}`);
      }
    }
  }, [codeToExec]);

  return (
    <div className={styles.console}>
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
  );
};

interface Props {
  codeToExec: string | undefined;
}
