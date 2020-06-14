import cn from 'classnames';
import React, { MutableRefObject, useEffect, useState } from 'react';
import { useList } from '~/platform/hooks/useList';
import { CommandHelp } from '../../components/CommandHelp';
import { AsyncExecutor } from '../AsyncExecutor';
import { BMError, BuildManagerClient, MessageType } from './BuildManagerClient';
import { Log } from './Log';
import { formatLogs } from './utils/formatLogs';
import { hasOption } from './utils/hasOption';

import styles from './BuildManager.module.scss';

const CODE_UNAUTHORIZED = 401;
const DEFAULT_ERROR_MESSAGE = 'An error occurred';

enum Command {
  Build = 'build',
  Login = 'login',
  Logs = 'logs',
}

const authTokenRef = { current: undefined } as MutableRefObject<
  string | undefined
>;

export const BuildManager: AsyncExecutor = ({
  alive,
  args,
  onQueryUser,
  onRelease,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [showHelp, setShowHelp] = useState(false);
  const [bmClient, setBMClient] = useState<BuildManagerClient>();
  const [logs, logManager] = useList<Log>();
  const command = args[0];

  useEffect(() => {
    if (hasOption(args, 'help')) {
      setShowHelp(true);
      onRelease();
      return;
    }

    const errorHandler = (error?: BMError) => {
      if (error?.code === CODE_UNAUTHORIZED) {
        authTokenRef.current = undefined;
      }

      setErrorMessage(error?.message || DEFAULT_ERROR_MESSAGE);
      onRelease();
    };

    switch (command) {
      case Command.Build: {
        if (args.length === 1) {
          setShowHelp(true);
          onRelease();
          return;
        }

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
              authToken: authTokenRef.current,
              args: args.slice(1),
              command: Command.Build,
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
                if (type === MessageType.AuthToken) {
                  authTokenRef.current = value;
                } else if (type === MessageType.Success) {
                  setSuccessMessage(value);
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
  }, [args, command, logManager, onQueryUser, onRelease]);

  useEffect(() => {
    if (!alive) {
      bmClient?.stop();
    }
  }, [alive, bmClient]);

  if (errorMessage) {
    return <p className={cn(styles.p, styles.error)}>✘ {errorMessage}</p>;
  }

  if (successMessage) {
    return <p className={cn(styles.p, styles.success)}>✔ {successMessage}</p>;
  }

  if (showHelp) {
    switch (command) {
      case Command.Build:
        return (
          <CommandHelp
            command="bm build"
            description="Build an application"
            parameters={[
              {
                name: 'options',
                optional: true,
                values: [
                  {
                    value: '-c, --clean',
                    description: 'recreate the docker image',
                  },
                ],
              },
              { name: 'repository' },
            ]}
          />
        );

      case Command.Logs:
        return (
          <CommandHelp
            command="bm logs"
            description="Display build logs"
            parameters={[
              {
                name: 'options',
                optional: true,
                values: [
                  {
                    value: '-f, --follow',
                    description: 'follow the output',
                  },
                ],
              },
              { name: 'repository' },
            ]}
          />
        );

      default:
        return (
          <CommandHelp
            command="bm"
            description="Build manager"
            parameters={[
              {
                name: 'command',
                values: [
                  { value: 'build', description: 'build an application' },
                  {
                    value: 'login',
                    description: 'gain access to restricted commands',
                  },
                  { value: 'logs', description: 'display build logs' },
                ],
              },
            ]}
          />
        );
    }
  }

  if (logs.length > 0) {
    return (
      <>
        {logs.map(({ data, id }) => (
          <p
            className={styles.p}
            dangerouslySetInnerHTML={{ __html: data }}
            key={id}
          />
        ))}
      </>
    );
  } else if (command === Command.Logs && !alive) {
    return <p className={styles.p}>No log to display</p>;
  }

  return null;
};

BuildManager.async = true;
