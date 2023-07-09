import { useList } from '@josselinbuils/hooks/useList';
import cn from 'classnames';
import { type MutableRefObject } from 'react';
import { useEffect, useState } from 'react';
import { CommandHelp } from '../../components/CommandHelp/CommandHelp';
import { type AsyncExecutor } from '../AsyncExecutor';
import styles from './BuildManager.module.scss';
import { type BMError } from './BuildManagerClient';
import { BuildManagerClient } from './BuildManagerClient';
import { type Log } from './Log';
import { formatLogs } from './utils/formatLogs';
import { hasOption } from './utils/hasOption';

const CODE_UNAUTHORIZED = 401;
const COMMANDS = ['build', 'login', 'logs'] as const;
const DEFAULT_ERROR_MESSAGE = 'An error occurred';

type Command = (typeof COMMANDS)[number];

const authTokenRef: MutableRefObject<string | undefined> = {
  current: undefined,
};

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
  const command = args[0] as Command | string;

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
      case 'build': {
        if (args.length === 1) {
          setShowHelp(true);
          onRelease();
          return;
        }

        const client = new BuildManagerClient();

        client
          .onError(errorHandler)
          .onClose(onRelease)
          .onMessage(async ({ type, value }) => {
            if (type === 'logs') {
              const formattedLogs = await formatLogs(value, styles.stepNumber);
              logManager.push(...formattedLogs);
            }
          })
          .waitUntilReady()
          .then(() =>
            client.send('command', {
              authToken: authTokenRef.current,
              args: args.slice(1),
              command: 'build' satisfies Command,
            }),
          );

        setBMClient(client);
        break;
      }

      case 'login': {
        onQueryUser(
          'password:',
          (password) => {
            const client = new BuildManagerClient();

            client
              .onError(errorHandler)
              .onClose(onRelease)
              .onMessage(({ type, value }) => {
                if (type === 'authToken') {
                  authTokenRef.current = value;
                } else if (type === 'success') {
                  setSuccessMessage(value);
                  onRelease();
                }
              })
              .waitUntilReady()
              .then(() =>
                client.send('command', {
                  command: 'login' satisfies Command,
                  args: [password],
                }),
              );

            setBMClient(client);
          },
          true,
        );
        break;
      }

      case 'logs': {
        const client = new BuildManagerClient();

        client
          .onError(errorHandler)
          .onClose(onRelease)
          .onMessage(async ({ value: lastLogs }) => {
            const follow = hasOption(args, 'follow');
            const formattedLogs = await formatLogs(lastLogs, styles.stepNumber);

            logManager.push(...formattedLogs);

            if (!follow) {
              onRelease();
            }
          })
          .waitUntilReady()
          .then(() =>
            client.send('command', { command: 'logs' satisfies Command }),
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
    if (!alive && bmClient) {
      bmClient.stop();
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
      case 'build':
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

      case 'logs':
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
  }
  if (command === 'logs' && !alive) {
    return <p className={styles.p}>No log to display</p>;
  }

  return null;
};

BuildManager.async = true;

BuildManager.suggest = (arg: string): string | undefined =>
  COMMANDS.find((command) => command.startsWith(arg));
