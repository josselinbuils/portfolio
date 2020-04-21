export interface Log {
  message: string;
  level: LogLevel;
}

export enum LogLevel {
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}
