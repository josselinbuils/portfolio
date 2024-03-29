import { Deferred } from '@josselinbuils/utils/Deferred';
import { useEffect, useRef, useState } from 'preact/compat';
import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { useList } from '@/platform/hooks/useList';
import styles from './Terminal.module.scss';
import { About } from './executors/About/About';
import { isAsyncExecutor, type AsyncExecutor } from './executors/AsyncExecutor';
import { BashError } from './executors/BashError/BashError';
import { Command, PREFIX_SIZE_CH } from './executors/Command/Command';
import { type Executor } from './executors/Executor';
import { UserQuery } from './executors/UserQuery';

const executors: { [name: string]: () => Promise<Executor | AsyncExecutor> } = {
  about: async () => About,
  bm: async () =>
    (await import('./executors/BuildManager/BuildManager')).BuildManager,
  help: async () => (await import('./executors/Help/Help')).Help,
  // Factory with dynamic import so no cycle
  // eslint-disable-next-line import/no-cycle
  open: async () => (await import('./executors/Open')).Open,
};

const initialExecutions: Execution[] = [
  {
    args: ['about'],
    executor: Command,
    id: 0,
  },
  {
    args: [],
    executor: About,
    id: 1,
  },
];

const Terminal: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => {
  const [caretIndex, setCaretIndex] = useState(0);
  const [commands, commandManager] = useList<string>([
    'bm logs -f',
    initialExecutions[0].args[0],
  ]);
  const [commandIndex, setCommandIndex] = useState(commands.length);
  const [executions, executionManager] = useList<Execution>(initialExecutions);
  const [userInput, setUserInput] = useState('');
  const executorIdRef = useRef(initialExecutions.length - 1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const lastExec = executions[executions.length - 1];
  const query = lastExec?.query;
  const waiting = lastExec?.inProgress === true;

  useKeyMap(
    {
      'Control+C': cancel,
      'CtrlCmd+K': () => {
        if (waiting && !query) {
          return false;
        }
        executionManager.clear();
      },
      '*': (event) => {
        if (waiting && !query) {
          return false;
        }

        if (event.key.length === 1) {
          if (event.altKey || event.metaKey || event.ctrlKey) {
            return false;
          }
          setUserInput(
            (input) =>
              input.slice(0, caretIndex) + event.key + input.slice(caretIndex),
          );
          setCaretIndex((index) => index + 1);
        } else if (!event.altKey && !event.ctrlKey && !event.metaKey) {
          return navigate(event);
        } else {
          return false;
        }
      },
    },
    active,
  );

  useEffect(() => {
    const terminal = terminalRef.current as HTMLElement;

    const observer = new MutationObserver(() => {
      terminal.scrollTop = terminal.scrollHeight;
    });

    observer.observe(terminal, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  async function cancel(): Promise<void> {
    if (waiting) {
      lastExec.inProgress = false;

      if (query) {
        const { hideAnswer, str } = query;

        await loadExecutor(UserQuery, [
          str,
          formatAnswer(userInput, hideAnswer),
        ]);
        delete lastExec.query;

        setUserInput('');
        setCaretIndex(0);
      }
      executionManager.update();
    } else {
      setUserInput('');
      setCaretIndex(0);
      await loadExecutor(Command, [userInput]);
    }
  }

  async function exec(str: string): Promise<void> {
    // Removes unnecessary spaces
    const cleanStr = str.split(' ').filter(Boolean).join(' ');

    if (query) {
      setUserInput('');
      setCaretIndex(0);
      await loadExecutor(UserQuery, [
        query.str,
        formatAnswer(str, query.hideAnswer),
      ]);
      delete lastExec.query;

      executionManager.set((execs) => {
        const userQuery = execs.pop() as Execution;
        const currentExec = execs.pop() as Execution;
        return [...execs, userQuery, currentExec];
      });

      query.callback(cleanStr);
      return;
    }

    const args = cleanStr.split(' ');
    const command = args[0];

    if (command.length > 0) {
      let executor: Executor | AsyncExecutor | undefined;

      if (executors[command] !== undefined) {
        executor = await executors[command](); // Has to be done before any state change
      }

      setUserInput('');
      setCaretIndex(0);

      if (commands[commands.length - 1] !== str) {
        commandManager.push(str);
        setCommandIndex(commands.length + 1);
      } else {
        setCommandIndex(commands.length);
      }

      if (command === 'clear') {
        executionManager.clear();
      } else if (executor !== undefined) {
        await Promise.all([
          loadExecutor(Command, [str]),
          loadExecutor(executor, args.slice(1)),
        ]);
      } else {
        await Promise.all([
          loadExecutor(Command, [str]),
          loadExecutor(BashError, [command]),
        ]);
      }
    } else {
      await loadExecutor(Command, [str]);
    }
  }

  function formatAnswer(str: string, hide: boolean): string {
    return hide ? str.replace(/./g, '*') : str;
  }

  function getCaretOffset(): number {
    if (!waiting) {
      return PREFIX_SIZE_CH + caretIndex;
    }
    if (query) {
      return query.str.length + caretIndex + 1;
    }
    return 0;
  }

  async function loadExecutor(
    executor: Executor | AsyncExecutor,
    args: string[],
  ): Promise<void> {
    const execution: Execution = {
      args,
      executor,
      id: ++executorIdRef.current,
    };

    if (isAsyncExecutor(executor)) {
      const deferred = new Deferred<Error | undefined>();

      execution.inProgress = true;
      execution.releaseHandler = deferred.resolve;
      execution.queryUserHandler = (str, callback, hideAnswer = false) => {
        execution.query = { callback, hideAnswer, str };
        executionManager.update();
      };
      executionManager.push(execution);

      await deferred.promise;
      execution.inProgress = false;
      executionManager.update();
    } else {
      executionManager.push(execution);
    }
  }

  function navigate(event: KeyboardEvent): false | void {
    // eslint-disable-next-line default-case
    switch (event.key) {
      case 'ArrowDown':
      case 'Down':
        if (!query && commandIndex < commands.length) {
          const newIndex = commandIndex + 1;
          const newCommand =
            newIndex < commands.length ? commands[newIndex] : '';
          setCommandIndex(newIndex);
          setUserInput(newCommand);
          setCaretIndex(newCommand.length);
        }
        break;

      case 'ArrowLeft':
      case 'Left':
        if (caretIndex > 0) {
          setCaretIndex(caretIndex - 1);
        }
        break;

      case 'ArrowRight':
      case 'Right':
        if (caretIndex < userInput.length) {
          setCaretIndex(caretIndex + 1);
        }
        break;

      case 'ArrowUp':
      case 'Up':
        if (!query && commandIndex > 0) {
          const newIndex = commandIndex - 1;
          const newCommand = commands[newIndex];
          setCommandIndex(newIndex);
          setUserInput(newCommand);
          setCaretIndex(newCommand.length);
        }
        break;

      case 'Backspace':
        if (caretIndex > 0) {
          setUserInput(
            userInput.slice(0, caretIndex - 1) + userInput.slice(caretIndex),
          );
          setCaretIndex(caretIndex - 1);
        }
        break;

      case 'Enter':
        exec(userInput);
        break;

      case 'Tab':
        if (!query && userInput.length > 0) {
          suggest(userInput).then((suggestedUserInput) => {
            if (suggestedUserInput !== undefined) {
              setUserInput(suggestedUserInput);
              setCaretIndex(suggestedUserInput.length);
            }
          });
        } else {
          return false;
        }
    }
  }

  async function suggest(str: string): Promise<string | undefined> {
    // Removes unnecessary spaces
    const cleanStr = str.split(' ').filter(Boolean).join(' ');
    const args = cleanStr.split(' ');
    const command = args[0];

    if (!command) {
      return undefined;
    }

    if ('clear'.startsWith(command)) {
      return 'clear';
    }

    if (executors[command] === undefined && args.length === 1) {
      return Object.keys(executors).find((c) => c.startsWith(command));
    }

    if (executors[command] !== undefined && args.length === 2) {
      const executor = await executors[command]();
      const suggestedArg = executor.suggest?.(args[1]);

      if (suggestedArg !== undefined) {
        return `${command} ${suggestedArg}`;
      }
    }
    return undefined;
  }

  return (
    <Window
      active={active}
      className={styles.terminalWindow}
      minHeight={400}
      minWidth={800}
      ref={windowRef}
      title="Terminal"
      titleClassName={styles.terminalTitleBar}
      {...injectedWindowProps}
    >
      <div className={styles.terminal} ref={terminalRef}>
        {executions.map(
          ({
            args,
            executor: ExecutorComponent,
            id,
            inProgress,
            queryUserHandler,
            releaseHandler,
          }) =>
            isAsyncExecutor(ExecutorComponent) ? (
              <ExecutorComponent
                alive={inProgress as boolean}
                args={args}
                key={id}
                onQueryUser={queryUserHandler as () => void}
                onRelease={releaseHandler as () => void}
                userInput={userInput}
              />
            ) : (
              <ExecutorComponent args={args} key={id} />
            ),
        )}
        <noscript className={styles.error}>
          ✘ failed to run command bin/zsh: JavaScript disabled
        </noscript>
        <div className={styles.userInput}>
          {!waiting && <Command args={[userInput]} />}
          {query && (
            <UserQuery
              args={[query.str, formatAnswer(userInput, query.hideAnswer)]}
            />
          )}
          <span
            className={styles.caret}
            style={{
              left: `${getCaretOffset()}ch`,
            }}
          >
            {userInput.substr(caretIndex, 1)}
          </span>
        </div>
      </div>
    </Window>
  );
};

export default Terminal;

interface Execution {
  args: string[];
  executor: Executor | AsyncExecutor;
  id: number;
  inProgress?: boolean;
  query?: {
    hideAnswer: boolean;
    str: string;
    callback(userInput: string): void;
  };
  queryUserHandler?(
    query: string,
    callback: (userInput: string) => void,
    hideAnswer?: boolean,
  ): void;
  releaseHandler?(error: Error | undefined): void;
}
