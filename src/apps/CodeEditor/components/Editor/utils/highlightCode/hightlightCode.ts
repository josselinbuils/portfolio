import Prism, { Environment, hooks, Token } from 'prismjs';
import 'prismjs/components/prism-javascript.min';

import styles from './darcula.module.scss';

export function highlightCode(code: string): string {
  Prism.hooks.add('after-tokenize', afterTokenizeHook);
  Prism.hooks.add('wrap', wrapHook);

  const highlighted = Prism.highlight(
    code,
    Prism.languages.javascript,
    'javascript'
  );

  removeHook('after-tokenize', afterTokenizeHook);
  removeHook('wrap', wrapHook);

  return highlighted.slice(-1) === '\n' ? `${highlighted} ` : highlighted;
}

function afterTokenizeHook(env: Environment): void {
  (env.tokens as (string | Token)[])
    .filter((token) => (token as Token).content === ';')
    .forEach((token) => {
      (token as Token).type = 'keyword';
    });
}

function removeHook(name: string, callback: hooks.HookCallback): void {
  const callbacks = Prism.hooks.all[name];
  const callbackIndex = callbacks.indexOf(callback);

  if (callbackIndex !== -1) {
    callbacks.splice(callbackIndex, 1);
  }
}

function wrapHook(env: Environment): void {
  env.classes = (env.classes as string[]).map((c) => styles[c]);
}
