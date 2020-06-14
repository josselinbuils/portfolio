/* tslint:disable:ordered-imports */
import Prism, { Environment, hooks, Token } from 'prismjs';
import 'prismjs/components/prism-css.min';
import 'prismjs/components/prism-javascript.min';
import 'prismjs/components/prism-json.min';
import 'prismjs/components/prism-markdown.min';
import 'prismjs/components/prism-markup.min';
import 'prismjs/components/prism-markup-templating.min';
import 'prismjs/components/prism-php.min';
import 'prismjs/components/prism-scss.min';
import 'prismjs/components/prism-typescript.min';
import 'prismjs/components/prism-yaml.min';

import styles from './darcula.module.scss';

export async function highlightCode(
  code: string,
  language: string
): Promise<string> {
  if (Prism.languages[language] === undefined) {
    return escapeHtml(code);
  }

  Prism.hooks.add('after-tokenize', afterTokenizeHook);
  Prism.hooks.add('wrap', wrapHook);

  const highlighted = Prism.highlight(
    code,
    Prism.languages[language],
    language
  );

  removeHook('after-tokenize', afterTokenizeHook);
  removeHook('wrap', wrapHook);

  return highlighted.slice(-1) === '\n' ? `${highlighted} ` : highlighted;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
