import { Deferred } from '@josselinbuils/utils';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { useEventListener, useList } from '~/platform/hooks';
import {
  About,
  AsyncExecutor,
  BashError,
  BuildManager,
  Command,
  Executor,
  Help,
  isAsyncExecutor,
  Open,
  Skills,
  UserQuery,
  Work,
} from './executors';
import { TerminalDescriptor } from './TerminalDescriptor';

import styles from './Terminal.module.scss';

const USER = 'guest';

const executors: { [name: string]: Executor | AsyncExecutor } = {
  about: About,
  bm: BuildManager,
  help: Help,
  open: Open,
  skills: Skills,
  work: Work,
};

const initialExecutions: Execution[] = [
  {
    args: [USER, 'about'],
    executor: Command,
    id: 0,
  },
  {
    args: [],
    executor: executors.about,
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
  const waiting = lastExec !== undefined && lastExec.inProgress === true;

  useEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (
        !event.altKey &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'c'
      ) {
        event.preventDefault();

        if (waiting) {
          lastExec.inProgress = false;
          executionManager.update();
        } else {
          loadExecutor(Command, [USER, userInput]);
          setUserInput('');
        }
      }

      if (waiting && !lastExec.query) {
        return;
      }

      if (
        !event.altKey &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        executionManager.clear();
      } else if (event.key.length === 1) {
        if (
          /[a-z]/i.test(event.key) &&
          (event.altKey || event.metaKey || event.ctrlKey)
        ) {
          return;
        }
        event.preventDefault();
        setUserInput(
          (input) =>
            input.slice(0, caretIndex) + event.key + input.slice(caretIndex)
        );
        setCaretIndex((index) => index + 1);
      } else if (!event.altKey && !event.ctrlKey && !event.metaKey) {
        navigate(event);
      }
    },
    active
  );

  useLayoutEffect(() => {
    const terminal = terminalRef.current as HTMLElement;

    const observer = new MutationObserver(
      () => (terminal.scrollTop = terminal.scrollHeight)
    );

    observer.observe(terminal, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  async function exec(str: string): Promise<void> {
    if (lastExec?.query) {
      const { query } = lastExec;

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

      query.callback(str);
      return;
    }

    const command = str.trim().split(' ')[0];

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
        await loadExecutor(executors[command], str.split(' ').slice(1));
      } else {
        await loadExecutor(BashError, [command]);
      }
    }
  }

  function formatAnswer(str: string, hide: boolean): string {
    return hide ? userInput.replace(/./g, '*') : userInput;
  }

  function getCaretOffset(): number {
    if (!waiting) {
      return USER.length + caretIndex + 2;
    }
    if (lastExec.query) {
      return lastExec.query.str.length + caretIndex + 1;
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
        query: string,
        callback: (userInput: string) => void,
        hideAnswer: boolean = false
      ) => {
        execution.query = {
          callback,
          hideAnswer,
          str: query,
        };
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

  function navigate(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'Down':
        event.preventDefault();
        if (commandIndex < commands.length) {
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
        event.preventDefault();
        if (caretIndex > 0) {
          setCaretIndex(caretIndex - 1);
        }
        break;

      case 'ArrowRight':
      case 'Right':
        event.preventDefault();
        if (caretIndex < userInput.length) {
          setCaretIndex(caretIndex + 1);
        }
        break;

      case 'ArrowUp':
      case 'Up':
        event.preventDefault();
        if (commandIndex > 0) {
          const newIndex = commandIndex - 1;
          const newCommand = commands[newIndex];
          setCommandIndex(newIndex);
          setUserInput(newCommand);
          setCaretIndex(newCommand.length);
        }
        break;

      case 'Backspace':
        event.preventDefault();
        if (caretIndex > 0) {
          setUserInput(
            userInput.slice(0, caretIndex - 1) + userInput.slice(caretIndex)
          );
          setCaretIndex(caretIndex - 1);
        }
        break;

      case 'Enter':
        event.preventDefault();
        setUserInput('');
        setCaretIndex(0);
        exec(userInput);
        break;

      case 'Tab':
        event.preventDefault();

        if (userInput.length === 0) {
          return;
        }
        const command = Object.keys(executors).find(
          (c) => c.indexOf(userInput) === 0
        );

        if (command !== undefined) {
          setUserInput(command);
          setCaretIndex(command.length);
        }
        break;

      default:
      // Does nothing
    }
  }

  return (
    <Window
      {...injectedWindowProps}
      active={active}
      background="rgba(30, 30, 30, 0.9)"
      minHeight={400}
      minWidth={800}
      ref={windowRef}
      title={TerminalDescriptor.appName}
      titleBackground="#f0f0f0"
      titleColor="#2f2f2f"
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
        <div className={styles.userInput}>
          {!waiting && <Command args={[USER, userInput]} />}
          {lastExec.query && (
            <UserQuery
              args={[
                lastExec.query.str,
                formatAnswer(userInput, lastExec.query.hideAnswer),
              ]}
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

Terminal.appDescriptor = TerminalDescriptor;

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
  releaseHandler?(): void;
}
