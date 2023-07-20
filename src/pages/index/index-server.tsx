// eslint-disable-next-line import/no-extraneous-dependencies
import { renderToString } from 'preact-render-to-string';
import { Index } from './Index';

export function render(): string {
  return renderToString(<Index />);
}
