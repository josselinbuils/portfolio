// eslint-disable-next-line import/no-extraneous-dependencies
import { renderToString } from 'preact-render-to-string';
import { Home } from './Home';

export function render(): string {
  return renderToString(<Home />);
}
