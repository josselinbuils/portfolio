import { type FunctionComponent } from 'preact';

import { type Executor, type ExecutorProps } from './Executor';

export type AsyncExecutor = FunctionComponent<
  AsyncExecutorProps & ExecutorProps
> & {
  async: boolean;
  suggest?(arg: string): string | undefined;
};

type AsyncExecutorProps = {
  alive: boolean;
  onQueryUser(
    query: string,
    callback: (userInput: string) => void,
    hideAnswer?: boolean,
  ): void;
  onRelease(): void;
  userInput: string | undefined;
};

export function isAsyncExecutor(
  executor: AsyncExecutor | Executor,
): executor is AsyncExecutor {
  return (executor as AsyncExecutor).async;
}
