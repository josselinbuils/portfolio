import { FC } from 'react';

export interface Executor extends FC<ExecutorProps> {
  async?: boolean;
}

export interface ExecutorProps {
  alive: boolean;
  args: string[];
  onRelease?: (error?: Error) => void;
}
