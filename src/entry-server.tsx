// eslint-disable-next-line import/no-extraneous-dependencies
import { renderToString } from 'preact-render-to-string';
import { App } from './App';

export function render(): string {
  return renderToString(<App />);
}
