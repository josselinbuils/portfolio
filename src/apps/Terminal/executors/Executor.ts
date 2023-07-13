import { type FC } from 'preact/compat';

export interface Executor extends FC<ExecutorProps> {
  suggest?(arg: string): string | undefined;
}

export interface ExecutorProps {
  args: string[];
}
