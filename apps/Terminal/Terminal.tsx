import { useKeyMap } from '@josselinbuils/hooks/useKeyMap';
import { useList } from '@josselinbuils/hooks/useList';
import { Deferred } from '@josselinbuils/utils/Deferred';
import { useEffect, useRef, useState } from 'react';
import { Window } from '~/platform/components/Window/Window';
import type { WindowComponent } from '~/platform/components/Window/WindowComponent';
import styles from './Terminal.module.scss';
import { About } from './executors/About/About';
import type { AsyncExecutor } from './executors/AsyncExecutor';
import { isAsyncExecutor } from './executors/AsyncExecutor';
import { BashError } from './executors/BashError/BashError';
import { Command } from './executors/Command/Command';
import type { Executor } from './executors/Executor';
import { UserQuery } from './executors/UserQuery';

const USER = 'guest';

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
    args: [USER, 'about'],
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
  const [commands, commandManager] = useList<string>(
    initialExecutions[0].args.slice(1)
  );
  const [commandIndex, setCommandIndex] = useState(1);
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
      'Control+K,Meta+K': () => {
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
              input.slice(0, caretIndex) + event.key + input.slice(caretIndex)
          );
          setCaretIndex((index) => index + 1);
        } else if (!event.altKey && !event.ctrlKey && !event.metaKey) {
          return navigate(event);
        } else {
          return false;
        }
      },
    },
    active
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
      loadExecutor(Command, [USER, userInput]);
      setUserInput('');
      setCaretIndex(0);
    }
  }

  async function exec(str: string): Promise<void> {
    // Removes unnecessary spaces
    const cleanStr = str.split(' ').filter(Boolean).join(' ');

    if (query) {
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

    await loadExecutor(Command, [USER, str]);

    if (command.length > 0) {
      if (commands[commands.length - 1] !== str) {
        commandManager.push(str);
        setCommandIndex(commands.length + 1);
      } else {
        setCommandIndex(commands.length);
      }

      if (command === 'clear') {
        executionManager.clear();
      } else if (executors[command] !== undefined) {
        const executor = await executors[command]();
        await loadExecutor(executor, args.slice(1));
      } else {
        await loadExecutor(BashError, [command]);
      }
    }
  }

  function formatAnswer(str: string, hide: boolean): string {
    return hide ? str.replace(/./g, '*') : str;
  }

  function getCaretOffset(): number {
    if (!waiting) {
      return USER.length + caretIndex + 2;
    }
    if (query) {
      return query.str.length + caretIndex + 1;
    }
    return 0;
  }

  async function loadExecutor(
    executor: Executor | AsyncExecutor,
    args: string[]
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
      execution.queryUserHandler = (
        str: string,
        callback: (userInput: string) => void,
        hideAnswer = false
      ) => {
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
            userInput.slice(0, caretIndex - 1) + userInput.slice(caretIndex)
          );
          setCaretIndex(caretIndex - 1);
        }
        break;

      case 'Enter':
        setUserInput('');
        setCaretIndex(0);
        exec(userInput);
        break;

      case 'Tab':
        if (!query && userInput.length > 0) {
          const command = Object.keys(executors).find(
            (c) => c.indexOf(userInput) === 0
          );

          if (command !== undefined) {
            setUserInput(command);
            setCaretIndex(command.length);
          }
        } else {
          return false;
        }
    }
  }

  return (
    <Window
      active={active}
      background="rgba(30, 30, 30, 0.9)"
      minHeight={400}
      minWidth={800}
      ref={windowRef}
      title="Terminal"
      titleBackground="#f0f0f0"
      titleColor="#2f2f2f"
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
            )
        )}
        <noscript className={styles.error}>
          ✘ failed to run command bin/bash: JavaScript disabled
        </noscript>
        <div className={styles.userInput}>
          {!waiting && <Command args={[USER, userInput]} />}
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
    hideAnswer?: boolean
  ): void;
  releaseHandler?(error: Error | undefined): void;
}
