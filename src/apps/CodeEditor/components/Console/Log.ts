import { type JSX } from 'preact/compat';

export enum LogLevel {
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}

export interface Log {
  id: string;
  level: LogLevel;
  message: (JSX.Element | string)[];
}
