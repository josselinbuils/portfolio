import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import cn from 'classnames';
import { forwardRef, type PropsWithChildren, Suspense } from 'preact/compat';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';

import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { useList } from '@/platform/hooks/useList';

import { Shortcut } from '../Shortcut/Shortcut';
import { Toolbar } from '../Toolbar/Toolbar';
import { ToolButton } from '../ToolButton/ToolButton';
import { Loader } from './components/Loader';
import { Logs } from './components/Logs/Logs';
import styles from './Console.module.scss';
import { type Log } from './Log';
import { decorateConsole } from './utils/decorateConsole';
import { execCode } from './utils/execCode';
import { observeMutations } from './utils/observeMutations';

export type ConsoleProps = PropsWithChildren & {
  active: boolean;
  className?: string;
  codeToExec: string | undefined;
  height: string;
};

export const Console = forwardRef<HTMLDivElement, ConsoleProps>(
  ({ active, children, className, codeToExec = '', height }, ref) => {
    const [logs, logManager] = useList<Log>([]);
    const [loading, setLoading] = useState(false);
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
        'CtrlCmd+E': () => execCode(codeToExec),
      },
      active,
    );

    return (
      <div
        className={cn(styles.console, className)}
        ref={ref}
        style={{ flexBasis: height }}
      >
        <Toolbar className={styles.toolbar}>
          <ToolButton
            disabled={!codeToExec}
            icon={faPlay}
            onClick={() => execCode(codeToExec)}
            title={
              <>
                Execute&nbsp;
                <Shortcut keys={['CtrlCmd', 'E']} />
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
        {children && (
          <>
            <Suspense fallback={<Loader onStateChange={setLoading} />}>
              {children}
            </Suspense>
            {!loading && <div className={styles.separator} />}
          </>
        )}
        <Logs className={styles.logs} logs={logs} ref={logsElementRef} />
      </div>
    );
  },
);
