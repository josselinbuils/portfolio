import { ListManager } from '@josselinbuils/hooks/useList';
import { createGUID } from '~/platform/utils/createGUID';
import { highlightCode } from '~/platform/utils/highlightCode/highlightCode';
import { Log, LogLevel } from '../Log';

export function decorateConsole(logManager: ListManager<Log>): () => void {
  const originalConsoleError = console.error.bind(console.error);
  const originalConsoleLog = console.log.bind(console.log);

  console.error = (error?: any) => {
    originalConsoleError(error);

    if (error instanceof Error) {
      const position = error.stack?.match(
        /^[^\n]+\n[^\n]+<anonymous>:(\d+:\d+)/
      );
      const formattedPosition = position ? `\n    at ${position[1]}` : '';

      logManager.push({
        id: createGUID(),
        level: LogLevel.Error,
        message: `${error.message}${formattedPosition}`,
      });
    } else if (error) {
      logManager.push({
        id: createGUID(),
        level: LogLevel.Error,
        message: error.toString(),
      });
    }
  };

  // Should not be async as it creates side effects as making eval function
  // return a promise
  console.log = (...args: any[]) => {
    originalConsoleLog(...args);

    logManager.push({
      id: createGUID(),
      level: LogLevel.Info,
      message: args.map(highlight).join(' '),
    });
  };

  return () => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  };
}

function highlight(code: string): string {
  return highlightCode(prettify(code), 'javascript');
}

function prettify(value: any): string {
  let prettified = `${value}`;

  const replaceLineBreaks = (str: string) => str.replace(/\n|\\n/g, '↵');

  if (typeof value === 'string') {
    prettified = `'${value}'`;
  } else if (Array.isArray(value)) {
    const items = value.map((v) => replaceLineBreaks(prettify(v)));
    prettified = `[${items.join(', ')}]`;
  } else if (value && value.toString() === '[object Object]') {
    prettified = replaceLineBreaks(JSON.stringify(value));
  }

  const matches = prettified.match(/^\[object ([^\]]+)]$/);

  if (matches !== null) {
    prettified = matches[1];
  }

  return prettified;
}
