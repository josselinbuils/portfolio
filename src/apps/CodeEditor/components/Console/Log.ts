import { type JSX } from 'preact/compat';

export interface Log {
  id: string;
  level: LogLevel;
  message: (string | JSX.Element)[];
}

export enum LogLevel {
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}
