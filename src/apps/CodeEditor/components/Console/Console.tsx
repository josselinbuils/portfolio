import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import cn from 'classnames';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'preact/compat';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { useList } from '@/platform/hooks/useList';
import { Shortcut } from '../Shortcut/Shortcut';
import { ToolButton } from '../ToolButton/ToolButton';
import { Toolbar } from '../Toolbar/Toolbar';
import styles from './Console.module.scss';
import { type Log } from './Log';
import { Logs } from './components/Logs/Logs';
import { decorateConsole } from './utils/decorateConsole';
import { execCode } from './utils/execCode';
import { observeMutations } from './utils/observeMutations';

export interface ConsoleProps {
  active: boolean;
  className?: string;
  codeToExec: string | undefined;
  height: string;
}

export const Console = forwardRef<HTMLDivElement, ConsoleProps>(
  ({ active, className, codeToExec = '', height }, ref) => {
    const [logs, logManager] = useList<Log>([]);
    const logsElementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (active) {
        return decorateConsole(logManager);
      }
    }, [active, logManager]);

    useLayoutEffect(() => {
      const logsElement = logsElementRef.current as HTMLElement;

      return observeMutations(logsElement, () => {
        logsElement.scrollTop = logsElement.scrollHeight;
      });
    }, []);

    useKeyMap(
      {
        'Control+E,Meta+E': () => execCode(codeToExec),
      },
      active,
    );

    return (
      <div
        className={cn(styles.console, className)}
        style={{ flexBasis: height }}
        ref={ref}
      >
        <Toolbar className={styles.toolbar}>
          <ToolButton
            disabled={!codeToExec}
            icon={faPlay}
            onClick={() => execCode(codeToExec)}
            title={
              <>
                Execute
                <Shortcut keys={['Ctrl', 'E']} />
              </>
            }
          />
          <ToolButton
            disabled={logs.length === 0}
            icon={faTrash}
            onClick={() => logManager.clear()}
            title="Clear"
          />
        </Toolbar>
        <Logs className={styles.logs} logs={logs} ref={logsElementRef} />
      </div>
    );
  },
);
