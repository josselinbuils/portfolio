enum Level {
  Error = 'ERROR',
  Info = 'INFO'
}

export class Logger {
  static error(str: string): void {
    log(Level.Error, str);
  }

  static info(str: string): void {
    log(Level.Info, str);
  }
}

function formatLevel(level: Level): string {
  switch (level) {
    case Level.Error:
      return '\x1b[91m[' + level + ']';
    case Level.Info:
      return '\x1b[32m[' + level + ']\x1b[0m';
    default:
      throw new Error('Unknown log level');
  }
}

function log(level: Level, str: string): void {
  const date = new Date();
  const dateString = date.toDateString();
  const timeString = date.toLocaleTimeString();

  console.log(
    `\x1b[0m[${dateString} ${timeString}] ${formatLevel(level)} ${str}\x1b[0m`
  );
}
