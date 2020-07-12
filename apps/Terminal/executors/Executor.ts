import { FC } from 'react';

export type Executor = FC<ExecutorProps>;

export interface ExecutorProps {
  args: string[];
}
