const isProduction = process.env.NODE_ENV === 'production';

type LogLevel = 'error' | 'info';

export class Logger {
  static error(str: string): void {
    log('error', str);
  }

  static info(str: string): void {
    log('info', str);
  }
}

function formatLevel(level: LogLevel): string {
  switch (level) {
    case 'error':
      return `\x1b[91m[${level.toUpperCase()}]`;
    case 'info':
      return `\x1b[32m[${level.toUpperCase()}]\x1b[0m`;
    default:
      throw new Error('Unknown log level');
  }
}

function log(level: LogLevel, str: string): void {
  const date = new Date();

  console.log(
    `\x1b[0m${
      isProduction
        ? `[${date.toDateString()} ${date.toLocaleTimeString()}] `
        : ''
    }${formatLevel(level)} ${str}\x1b[0m`,
  );
}
