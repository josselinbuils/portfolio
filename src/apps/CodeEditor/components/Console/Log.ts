import { type JSX } from 'preact';

export enum LogLevel {
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}

export type Log = {
  id: string;
  level: LogLevel;
  message: (JSX.Element | string)[];
};
