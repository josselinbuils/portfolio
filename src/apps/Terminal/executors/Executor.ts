import { type FunctionComponent } from 'preact';

export interface Executor extends FunctionComponent<ExecutorProps> {
  suggest?(arg: string): string | undefined;
}

export interface ExecutorProps {
  args: string[];
}
