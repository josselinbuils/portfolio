import { faBomb } from '@fortawesome/free-solid-svg-icons/faBomb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { forwardRef } from 'react';
import { Log, LogLevel } from '../../Log';

import styles from './Logs.module.scss';

export const Logs = forwardRef<HTMLDivElement, Props>(
  ({ className, logs }, ref) => (
    <div className={cn(styles.logs, className)} ref={ref}>
      {logs.map(({ level, message }, index) =>
        level === LogLevel.Error ? (
          // TODO generate a GUID
          // eslint-disable-next-line react/no-array-index-key
          <div className={cn(styles.log, styles[level])} key={index}>
            <span className={styles.errorMessage}>
              <FontAwesomeIcon icon={faBomb} /> {message.split('\n')[0]}
              {'\n'}
            </span>
            <span className={styles.errorStack}>
              {message.split('\n').slice(1).join('\n')}
            </span>
          </div>
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: message }}
            className={cn(styles.log, styles[level])}
            // eslint-disable-next-line react/no-array-index-key
            key={index}
          />
        )
      )}
    </div>
  )
);

interface Props {
  className?: string;
  logs: Log[];
}
