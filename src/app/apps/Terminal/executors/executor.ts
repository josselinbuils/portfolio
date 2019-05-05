import { FC } from 'react';

export interface Executor extends FC<ExecutorProps> {
  async?: true;
}

export interface ExecutorProps {
  alive: boolean;
  args: string[];
}
