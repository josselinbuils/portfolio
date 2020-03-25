import { Deferred } from '@josselinbuils/utils';
import React, { useEffect, useRef, useState } from 'react';
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
  Work
} from './executors';
import { TerminalDescriptor } from './TerminalDescriptor';

import styles from './Terminal.module.scss';

const DEFAULT_ERROR_MESSAGE = 'an error occurred';
const USER = 'guest';

const executors: { [name: string]: Executor | AsyncExecutor } = {
  about: About,
  bm: BuildManager,
  help: Help,
  open: Open,
  skills: Skills,
  work: Work
};

const Terminal: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => {
  const [caretIndex, setCaretIndex] = useState(0);
  const [commands, commandManager] = useList<string>();
  const [commandIndex, setCommandIndex] = useState(0);
  const [executions, executionManager] = useList<Execution>();
  const [userInput, setUserInput] = useState('');
  const executorIdRef = useRef(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const lastExec = executions[executions.length - 1];
  const waiting = lastExec !== undefined && lastExec.inProgress === true;

  async function exec(str: string): Promise<void> {
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
        try {
          await loadExecutor(executors[command], str.split(' ').slice(1));
        } catch (error) {
          const errorMessage = error.message || DEFAULT_ERROR_MESSAGE;
          await loadExecutor(BashError, [command, errorMessage]);
        }
      } else {
        await loadExecutor(BashError, [command]);
      }
    }
  }

  async function loadExecutor(
    executor: Executor | AsyncExecutor,
    args: string[]
  ): Promise<void> {
    const execution: Execution = {
      args,
      executor,
      id: ++executorIdRef.current
    };

    if (isAsyncExecutor(executor)) {
      const deferred = new Deferred<Error | undefined>();

      execution.inProgress = true;
      execution.releaseHandler = deferred.resolve;
      executionManager.push(execution);

      const error = await deferred.promise;
      execution.inProgress = false;
      executionManager.update();

      if (error) {
        throw error;
      }
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
          c => c.indexOf(userInput) === 0
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
          executions[executions.length - 1].inProgress = false;
          executionManager.update();
        } else {
          loadExecutor(Command, [USER, userInput]);
          setUserInput('');
        }
      }

      if (waiting) {
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
          input =>
            input.slice(0, caretIndex) + event.key + input.slice(caretIndex)
        );
        setCaretIndex(index => index + 1);
      } else if (!event.altKey && !event.ctrlKey && !event.metaKey) {
        navigate(event);
      }
    },
    active
  );

  useEffect(() => {
    const terminal = terminalRef.current as HTMLElement;

    const observer = new MutationObserver(
      () => (terminal.scrollTop = terminal.scrollHeight)
    );

    observer.observe(terminal, {
      childList: true,
      subtree: true
    });

    exec('about');

    return () => observer.disconnect();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            releaseHandler
          }) =>
            isAsyncExecutor(ExecutorComponent) ? (
              <ExecutorComponent
                alive={inProgress as boolean}
                args={args}
                key={id}
                onRelease={releaseHandler as () => void}
              />
            ) : (
              <ExecutorComponent args={args} key={id} />
            )
        )}
        <div className={styles.userInput}>
          {!waiting && <Command args={[USER, userInput]} />}
          <span
            className={styles.caret}
            style={{ left: !waiting ? `${USER.length + caretIndex + 2}ch` : 0 }}
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
  releaseHandler?(error?: Error): void;
}
