import { type JSX } from 'preact';

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
