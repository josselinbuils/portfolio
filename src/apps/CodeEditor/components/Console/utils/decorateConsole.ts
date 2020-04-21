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
      logManager.push({ level: LogLevel.Error, message: error.toString() });
    }
    originalConsoleError(error, ...additionalArgs);
  };

  console.log = (message?: any, ...additionalArgs: any[]) => {
    if (message) {
      logManager.push({ level: LogLevel.Info, message: message.toString() });
    }
    originalConsoleLog(message, ...additionalArgs);
  };

  return () => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  };
}
