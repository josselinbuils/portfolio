import { type ListManager } from '@josselinbuils/hooks/useList';
import { type JSX } from 'preact/compat';
import { createGUID } from '@/platform/utils/createGUID';
import { highlightCode } from '@/platform/utils/highlightCode/highlightCode';
import { Shortcut } from '../../Shortcut/Shortcut';
import { type Log } from '../Log';
import { LogLevel } from '../Log';

export function decorateConsole(logManager: ListManager<Log>): () => void {
  const originalConsoleError = console.error.bind(console.error);
  const originalConsoleLog = console.log.bind(console.log);

  console.error = (error?: any) => {
    originalConsoleError(error);

    if (error instanceof Error) {
      const position = error.stack?.match(
        /^[^\n]+\n[^\n]+<anonymous>:(\d+:\d+)/,
      );
      const formattedPosition = position ? `\n    at ${position[1]}` : '';

      logManager.push({
        id: createGUID(),
        level: LogLevel.Error,
        message: `${error.message}${formattedPosition}`.split('\n'),
      });
    } else if (error) {
      logManager.push({
        id: createGUID(),
        level: LogLevel.Error,
        message: error.toString().split('\n'),
      });
    }
  };

  // Should not be async as it creates side effects as making eval function
  // return a promise
  console.log = (...args: any[]) => {
    originalConsoleLog(...args);

    const id = createGUID();

    logManager.push({
      id,
      level: LogLevel.Info,
      message: args.map((arg) => prettify(arg, id)),
    });
  };

  return () => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  };
}

function prettify(value: any, id: string): string | JSX.Element {
  let prettified: string | JSX.Element = `${value}`;

  const replaceLineBreaks = (str: string) => str.replace(/\n|\\n/g, '↵');
  const isPrimitive = value !== Object(value);

  if (typeof value === 'string') {
    prettified = (
      <>
        {value.split(/\[\[([^\]]+)]]/).map((part, index) =>
          index % 2 === 0 ? (
            // eslint-disable-next-line react/no-array-index-key
            <span key={`${id}-${index}`}>{part}</span>
          ) : (
            // eslint-disable-next-line react/no-array-index-key
            <Shortcut key={`${id}-${index}`} keys={part.split('+')} />
          ),
        )}
      </>
    );
  } else if (isPrimitive) {
    prettified = highlightCode(`${value}`, 'javascript');
  } else if (Array.isArray(value)) {
    const items = value
      .map((v) => prettify(v, id))
      .map((v) => (typeof v === 'string' ? replaceLineBreaks(v) : v));
    prettified = `[${items.join(', ')}]`;
  } else if (value && value.toString() === '[object Object]') {
    prettified = replaceLineBreaks(JSON.stringify(value));
  }

  if (typeof prettified === 'string') {
    const matches = prettified.match(/^\[object ([^\]]+)]$/);

    if (matches !== null) {
      prettified = matches[1];
    }
  }

  return prettified;
}
