import { type FC } from 'react';

export interface Executor extends FC<ExecutorProps> {
  suggest?(arg: string): string | undefined;
}

export interface ExecutorProps {
  args: string[];
}
