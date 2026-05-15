import { faBomb } from '@fortawesome/free-solid-svg-icons/faBomb';
import cn from 'classnames';
import { forwardRef } from 'preact/compat';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import { type Log, LogLevel } from '../../Log';
import classes from './Logs.module.css';

export type LogsProps = {
  className?: string;
  logs: Log[];
};

export const Logs = forwardRef<HTMLDivElement, LogsProps>(
  ({ className, logs }, ref) => (
    <div className={cn(classes.logs, className)} ref={ref}>
      {logs.map(({ id, level, message }) => (
        <div className={cn(classes.log, classes[level])} key={id}>
          {level === LogLevel.Error ? (
            <>
              <span className={classes.errorMessage}>
                <FontAwesomeIcon icon={faBomb} /> {message[0]}
                {'\n'}
              </span>
              <span className={classes.errorStack}>{message.slice(1)}</span>
            </>
          ) : (
            message.map((line) =>
              typeof line === 'string' ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: message as unknown as string,
                  }}
                  key={`${id}-${message}`}
                />
              ) : (
                <span key={`${id}-${line.key}`}>{line}</span>
              ),
            )
          )}
        </div>
      ))}
    </div>
  ),
);
