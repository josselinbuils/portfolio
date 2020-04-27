import Prism, { Environment, hooks, Token } from 'prismjs';
import 'prismjs/components/prism-javascript.min';

import styles from './darcula.module.scss';

const languageComponents = {
  css: () => import('prismjs/components/prism-css.min' as any),
  javascript: () => import('prismjs/components/prism-javascript.min' as any),
  json: () => import('prismjs/components/prism-json.min' as any),
  makefile: () => import('prismjs/components/prism-makefile.min' as any),
  markdown: () => import('prismjs/components/prism-markdown.min' as any),
  php: () =>
    Promise.all([
      import('prismjs/components/prism-markup-templating.min' as any),
      import('prismjs/components/prism-php.min' as any),
    ]),
  scss: () => import('prismjs/components/prism-scss.min' as any),
  typescript: () => import('prismjs/components/prism-typescript.min' as any),
  twig: () => import('prismjs/components/prism-twig.min' as any),
  xml: () => import('prismjs/components/prism-markup.min' as any),
  yaml: () => import('prismjs/components/prism-yaml.min' as any),
} as { [language: string]: () => Promise<any> };

export async function highlightCode(
  code: string,
  language: string
): Promise<string> {
  if (languageComponents[language] === undefined) {
    return code;
  }

  await languageComponents[language]();

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
