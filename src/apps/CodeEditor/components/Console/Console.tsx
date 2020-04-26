import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import cn from 'classnames';
import React, { FC, useEffect, useLayoutEffect, useRef } from 'react';
import { Toolbar, ToolButton } from '~/apps/CodeEditor/components';
import { Logs } from '~/apps/CodeEditor/components/Console/components';
import { useKeyMap, useList } from '~/platform/hooks';
import { Log } from './Log';
import { decorateConsole, execCode, observeMutations } from './utils';

import styles from './Console.module.scss';

export const Console: FC<Props> = ({ active, className, codeToExec = '' }) => {
  const [logs, logManager] = useList<Log>([]);
  const logsElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active) {
      return decorateConsole(logManager);
    }
  }, [active, logManager]);

  useLayoutEffect(() => {
    const logsElement = logsElementRef.current as HTMLElement;

    return observeMutations(
      logsElement,
      () => (logsElement.scrollTop = logsElement.scrollHeight)
    );
  }, []);

  useKeyMap(
    {
      'Control+E,Meta+E': () => execCode(codeToExec),
    },
    active
  );

  return (
    <div className={cn(styles.console, className)}>
      <div className={styles.header}>Console</div>
      <Toolbar className={styles.toolbar}>
        <ToolButton
          disabled={!codeToExec}
          icon={faPlay}
          onClick={() => execCode(codeToExec)}
          title={
            <>
              Execute<kbd>Ctrl</kbd>+<kbd>E</kbd>
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
};

interface Props {
  active: boolean;
  className?: string;
  codeToExec: string | undefined;
}
