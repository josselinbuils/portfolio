import AnsiUp from 'ansi_up';
import React, { useEffect, useMemo, useState } from 'react';
import { useList } from '~/platform/hooks';
import { AsyncExecutor } from '../AsyncExecutor';
import { BuildManagerClient, MessageType } from './BuildManagerClient';
import { Log } from './Log';
import { formatLogs, hasOption } from './utils';

import styles from './BuildManager.module.scss';

const DEFAULT_ERROR_MESSAGE = 'An error occurred';

enum Command {
  Build = 'build',
  Login = 'login',
  Logs = 'logs',
}

export const BuildManager: AsyncExecutor = ({
  alive,
  args,
  onQueryUser,
  onRelease,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [infoMessage, setInfoMessage] = useState<string>();
  const [showHelp, setShowHelp] = useState(false);
  const [bmClient, setBMClient] = useState<BuildManagerClient>();
  const [logs, logManager] = useList<Log>();
  const ansiUp = useMemo(() => new AnsiUp(), []);
  const command = args[0];

  useEffect(() => {
    const errorHandler = (message?: string) => {
      setErrorMessage(
        message ? ansiUp.ansi_to_html(message) : DEFAULT_ERROR_MESSAGE
      );
      onRelease();
    };

    switch (command) {
      case Command.Build: {
        const client = new BuildManagerClient();

        client
          .onError(errorHandler)
          .onClose(onRelease)
          .onMessage(({ type, value }) => {
            if (type === MessageType.Logs) {
              logManager.push(...formatLogs(value, styles.stepNumber));
            }
          })
          .waitUntilReady()
          .then(() =>
            client.send(MessageType.Command, {
              command: Command.Build,
              args: args.slice(1),
            })
          );

        setBMClient(client);
        break;
      }

      case Command.Login: {
        onQueryUser(
          'password:',
          (password) => {
            const client = new BuildManagerClient();

            client
              .onError(errorHandler)
              .onClose(onRelease)
              .onMessage(({ type, value }) => {
                if (type === MessageType.Info) {
                  setInfoMessage(ansiUp.ansi_to_html(value));
                  onRelease();
                }
              })
              .waitUntilReady()
              .then(() =>
                client.send(MessageType.Command, {
                  command: Command.Login,
                  args: [password],
                })
              );

            setBMClient(client);
          },
          true
        );
        break;
      }

      case Command.Logs: {
        const client = new BuildManagerClient();

        client
          .onError(errorHandler)
          .onClose(onRelease)
          .onMessage(({ value: lastLogs }) => {
            const follow = hasOption(args, 'follow');

            logManager.push(...formatLogs(lastLogs, styles.stepNumber));

            if (!follow) {
              onRelease();
            }
          })
          .waitUntilReady()
          .then(() =>
            client.send(MessageType.Command, { command: Command.Logs })
          );

        setBMClient(client);
        break;
      }

      default:
        setShowHelp(true);
        onRelease();
    }
  }, [ansiUp, args, command, logManager, onQueryUser, onRelease]);

  useEffect(() => {
    if (!alive) {
      bmClient?.stop();
    }
  }, [alive, bmClient]);

  if (errorMessage) {
    return <p dangerouslySetInnerHTML={{ __html: errorMessage }} />;
  }

  if (infoMessage) {
    return <p dangerouslySetInnerHTML={{ __html: infoMessage }} />;
  }

  if (showHelp) {
    return (
      <div className={styles.help}>
        <p>Usage: bm command [args]</p>
        <p>Commands:</p>
        <p className={styles.command}>- build repository</p>
        <p className={styles.command}>- login</p>
        <p className={styles.command}>- logs [-f, --follow]</p>
      </div>
    );
  }

  if (logs.length > 0) {
    return (
      <>
        {logs.map(({ data, id }) => (
          <p dangerouslySetInnerHTML={{ __html: data }} key={id} />
        ))}
      </>
    );
  } else if (command === Command.Logs && !alive) {
    return <p>No log to display</p>;
  }

  return null;
};

BuildManager.async = true;
