import { hydrate } from 'preact';
import { Home } from './Home';

hydrate(<Home />, document.getElementById('app')!);
