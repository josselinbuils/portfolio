import { faBomb } from '@fortawesome/free-solid-svg-icons/faBomb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { forwardRef } from 'react';
import { Log, LogLevel } from '../../Log';

import styles from './Logs.module.scss';

export const Logs = forwardRef<HTMLDivElement, Props>(({ logs }, ref) => (
  <div className={styles.logs} ref={ref}>
    {logs.map(({ level, message }, index) => (
      <div className={cn(styles.log, styles[level])} key={index}>
        {level === LogLevel.Error ? (
          <>
            <span className={styles.errorMessage}>
              <FontAwesomeIcon icon={faBomb} /> {message.split('\n')[0]}
              {'\n'}
            </span>
            <span className={styles.errorStack}>
              {message.split('\n').slice(1).join('\n')}
            </span>
          </>
        ) : (
          message
        )}
      </div>
    ))}
  </div>
));

interface Props {
  logs: Log[];
}
