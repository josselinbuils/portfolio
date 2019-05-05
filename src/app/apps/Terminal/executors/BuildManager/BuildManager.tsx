import React, { useEffect, useState } from 'react';
import { useList, useMount } from '~/platform/hooks';
import { AsyncExecutor } from '../AsyncExecutor';
import { Log } from './Log';
import { hasOption, startWsClient, stopWsClient } from './utils';
import styles from './BuildManager.module.scss';
import { formatLogs } from '~/apps/Terminal/executors/BuildManager/utils/formatLogs';

export const BuildManager: AsyncExecutor = ({ alive, args, onRelease }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [ws, setWs] = useState<WebSocket>();
  const [logs, logManager] = useList<Log>();

  function errorHandler(): void {
    onRelease(new Error());
  }

  function logHandler(lastLogs: Log[]): void {
    const follow = hasOption(args, 'f');
    const stepClass = styles.stepNumber;

    logManager.push(...formatLogs(lastLogs, stepClass));

    if (!follow) {
      onRelease();
    }
  }

  useMount(() => {
    const command = args[0];

    if (command === 'logs') {
      setWs(startWsClient(logHandler, errorHandler));
    } else {
      setShowHelp(true);
      onRelease();
    }
  });

  useEffect(() => {
    if (!alive) {
      stopWsClient(ws);
    }
  }, [alive, ws]);

  return showHelp ? (
    <div className={styles.help}>
      <p>Usage: bm [command] [options]</p>
      <p>Commands: logs [-f]</p>
    </div>
  ) : (
    <>
      {logs.map(({ data, id }) => (
        <p dangerouslySetInnerHTML={{ __html: data }} key={id} />
      ))}
    </>
  );
};

BuildManager.async = true;
