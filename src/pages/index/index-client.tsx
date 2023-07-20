import { hydrate } from 'preact';
import { Index } from './Index';

hydrate(<Index />, document.getElementById('app')!);
