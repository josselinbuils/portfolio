import { FC } from 'react';

export interface Executor extends FC<ExecutorProps> {}

export interface ExecutorProps {
  args: string[];
}
