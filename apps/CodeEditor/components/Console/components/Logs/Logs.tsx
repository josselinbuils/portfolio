import { faBomb } from '@fortawesome/free-solid-svg-icons/faBomb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import { forwardRef } from 'react';
import { Log, LogLevel } from '../../Log';

import styles from './Logs.module.scss';

export const Logs = forwardRef<HTMLDivElement, Props>(
  ({ className, logs }, ref) => (
    <div className={cn(styles.logs, className)} ref={ref}>
      {logs.map(({ id, level, message }) =>
        level === LogLevel.Error ? (
          <div className={cn(styles.log, styles[level])} key={id}>
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
            key={id}
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
