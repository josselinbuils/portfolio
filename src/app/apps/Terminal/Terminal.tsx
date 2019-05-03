import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Window } from '~/platform/components/Window';
import { useEventListener, useList } from '~/platform/hooks';
import {
  InjectedWindowProps,
  WindowComponent
} from '~/platform/providers/WindowProvider';
import { About, BashError, Command, Executor } from './executors';
import styles from './Terminal.module.scss';

const USER = 'guest';

const executors: { [name: string]: Executor } = {
  about: About
};

export const Terminal: WindowComponent = ({
  active,
  ...rest
}: InjectedWindowProps) => {
  const [caretIndex, setCaretIndex] = useState(0);
  const [commands, commandManager] = useList<string>();
  const [commandIndex, setCommandIndex] = useState(0);
  const [executions, executionManager] = useList<Execution>();
  const [waiting] = useState(false);
  const [userInput, setUserInput] = useState('');
  const executorIdRef = useRef(-1);
  const terminalRef = useRef<HTMLDivElement>(null);

  function exec(str: string): void {
    const command = str.trim().split(' ')[0];

    loadExecutor(Command, [USER, str]);

    if (command.length > 0) {
      if (commands[commands.length - 1] !== command) {
        commandManager.push(command);
        setCommandIndex(commands.length + 1);
      } else {
        setCommandIndex(commands.length);
      }

      if (command === 'clear') {
        executionManager.clear();
      } else {
        if (executors[command]) {
          // TODO handle errors
          loadExecutor(executors[command], str.split(' ').slice(1));
        } else {
          loadExecutor(BashError, [command]);
        }
      }
    }
  }

  function loadExecutor(executor: Executor, args: string[]): void {
    executionManager.push({
      args,
      id: ++executorIdRef.current,
      inProgress: false,
      executor
    });
  }

  function navigate(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
      case 'Down':
        event.preventDefault();
        if (commandIndex < commands.length) {
          const newIndex = commandIndex + 1;
          setCommandIndex(newIndex);
          setUserInput(newIndex < commands.length ? commands[newIndex] : '');
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
          setCaretIndex(caretIndex - 1);
        }
        break;

      case 'ArrowUp':
      case 'Up':
        event.preventDefault();
        if (commandIndex > 0) {
          const newIndex = commandIndex - 1;
          setCommandIndex(newIndex);
          setUserInput(commands[newIndex]);
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
        }
        break;

      default:
      // Does nothing
    }
  }

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (!active) {
      return;
    }

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
        userInput.slice(0, caretIndex) + event.key + userInput.slice(caretIndex)
      );
      setCaretIndex(caretIndex + 1);
    } else if (!event.altKey && !event.ctrlKey && !event.metaKey) {
      navigate(event);
    }
  });

  useEffect(() => setCaretIndex(userInput.length), [userInput]);

  useLayoutEffect(() => {
    const terminalElement = terminalRef.current;

    if (terminalElement !== null) {
      terminalElement.scrollTop = terminalElement.scrollHeight;
    }
  }, [executions]);

  useEffect(() => {
    exec('about');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Window
      {...rest}
      active={active}
      background="rgba(30, 30, 30, 0.9)"
      minHeight={400}
      minWidth={800}
      title={Terminal.appName}
      titleBackground="#f0f0f0"
      titleColor="#2f2f2f"
    >
      <div className={styles.terminal} ref={terminalRef}>
        {executions.map(({ args, id, inProgress, executor: Executor }) => (
          <Executor alive={inProgress} args={args} key={id} />
        ))}
        <div className={styles.userInput}>
          {!waiting && <Command alive={false} args={[USER, userInput]} />}
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

Terminal.appName = 'Terminal';
Terminal.iconClass = 'fas fa-terminal';

interface Execution {
  args: string[];
  id: number;
  inProgress: boolean;
  executor: Executor;
}
