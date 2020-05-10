import { ListManager } from '~/platform/hooks/useList';
import { Log, LogLevel } from '../Log';

export function decorateConsole(logManager: ListManager<Log>): () => void {
  const originalConsoleError = console.error.bind(console.error);
  const originalConsoleLog = console.log.bind(console.log);

  console.error = (error?: any, ...additionalArgs: any[]) => {
    if (error instanceof Error) {
      const position = error.stack?.match(
        /^[^\n]+\n[^\n]+<anonymous>:(\d+:\d+)/
      );
      const formattedPosition = position ? `\n    at ${position[1]}` : '';

      logManager.push({
        level: LogLevel.Error,
        message: `${error.message}${formattedPosition}`,
      });
    } else if (error) {
      logManager.push({
        level: LogLevel.Error,
        message: [error.toString(), ...additionalArgs].map(prettify).join(' '),
      });
    }
    originalConsoleError(error, ...additionalArgs);
  };

  console.log = (...args: any[]) => {
    logManager.push({
      level: LogLevel.Info,
      message: [...args].map(prettify).join(' '),
    });
    originalConsoleLog(...args);
  };

  return () => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  };
}

function prettify(value: any): string {
  if ([null, undefined].includes(value)) {
    return `${value}`;
  }
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(prettify).join(', ')}]`;
  }
  if (value && value.toString() === '[object Object]') {
    return JSON.stringify(value);
  }
  return value;
}
