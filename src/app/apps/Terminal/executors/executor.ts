import { FC } from 'react';

export interface Executor extends FC<ExecutorProps> {
  type: ExecutorType;
}

export interface ExecutorProps {
  alive: boolean;
  args: string[];
}

export enum ExecutorType {
  Async,
  Sync
}
