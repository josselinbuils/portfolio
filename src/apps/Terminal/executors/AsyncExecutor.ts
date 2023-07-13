import { type FC } from 'react';
import { type Executor, type ExecutorProps } from './Executor';

export interface AsyncExecutor extends FC<ExecutorProps & AsyncExecutorProps> {
  async: boolean;
  suggest?(arg: string): string | undefined;
}

export function isAsyncExecutor(
  executor: Executor | AsyncExecutor,
): executor is AsyncExecutor {
  return (executor as AsyncExecutor).async;
}

interface AsyncExecutorProps {
  alive: boolean;
  userInput: string | undefined;
  onRelease(): void;
  onQueryUser(
    query: string,
    callback: (userInput: string) => void,
    hideAnswer?: boolean,
  ): void;
}
