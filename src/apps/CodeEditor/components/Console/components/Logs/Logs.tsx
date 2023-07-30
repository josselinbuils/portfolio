import { faBomb } from '@fortawesome/free-solid-svg-icons/faBomb';
import cn from 'classnames';
import { forwardRef } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { LogLevel, type Log } from '../../Log';
import styles from './Logs.module.scss';

export const Logs = forwardRef<HTMLDivElement, Props>(
  ({ className, logs }, ref) => (
    <div className={cn(styles.logs, className)} ref={ref}>
      {logs.map(({ id, level, message }) => (
        <div className={cn(styles.log, styles[level])} key={id}>
          {level === LogLevel.Error ? (
            <>
              <span className={styles.errorMessage}>
                <FontAwesomeIcon icon={faBomb} /> {message[0]}
                {'\n'}
              </span>
              <span className={styles.errorStack}>{message.slice(1)}</span>
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

interface Props {
  className?: string;
  logs: Log[];
}
