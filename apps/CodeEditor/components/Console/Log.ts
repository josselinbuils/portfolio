export interface Log {
  id: string;
  level: LogLevel;
  message: string;
}

export enum LogLevel {
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}
