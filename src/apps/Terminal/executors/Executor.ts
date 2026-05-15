import { type FunctionComponent } from 'preact';

export type Executor = FunctionComponent<ExecutorProps> & {
  suggest?(arg: string): string | undefined;
};

export type ExecutorProps = {
  args: string[];
};
