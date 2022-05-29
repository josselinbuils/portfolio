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

import styles from './manomano.module.scss';

const CLOSING_BRACKETS = [')', ']', '}'];
const OPENING_BRACKETS = ['(', '[', '{'];
const BRACKETS = [...OPENING_BRACKETS, ...CLOSING_BRACKETS];

export function highlightCode(
  code: string,
  language: string,
  cursorOffset?: number
): string {
  if (Prism.languages[language] === undefined) {
    return escapeHtml(code);
  }

  const afterTokenizeHookListener = (env: Environment) =>
    afterTokenizeHook(env, cursorOffset);

  Prism.hooks.add('after-tokenize', afterTokenizeHookListener);
  Prism.hooks.add('wrap', wrapHook);

  const highlighted = Prism.highlight(
    code,
    Prism.languages[language],
    language
  );

  removeHook('after-tokenize', afterTokenizeHookListener);
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

function afterTokenizeHook(
  env: Environment,
  cursorOffset: number | undefined
): void {
  (env.tokens as (string | Token)[])
    .filter((token) => (token as Token).content === ';')
    .forEach((token) => {
      (token as Token).type = 'keyword';
    });

  if (cursorOffset !== undefined) {
    let offset = 0;

    (env.tokens as (string | Token)[]).forEach((token) => {
      const isToken = typeof token !== 'string';

      if (isToken) {
        (token as any).offset = offset;
      }
      offset += getTokenLength(token);
    });

    const tokens = (env.tokens as (string | Token)[]).filter(
      (token) => typeof token !== 'string'
    ) as Token[];

    const tokenNearCursor = tokens.find(
      (token) =>
        BRACKETS.includes(token.content as string) &&
        [cursorOffset, cursorOffset - 1].includes((token as any).offset)
    );

    if (tokenNearCursor !== undefined) {
      tokenNearCursor.type = 'highlightedBracket';

      const couples: [{ offset: number; token: Token }][] = [];

      tokens.forEach((token: Token) => {
        const content = token.content as string;

        if (OPENING_BRACKETS.includes(content)) {
          couples.push([{ offset, token }]);
        } else if (CLOSING_BRACKETS.includes(content)) {
          const openingBracket =
            OPENING_BRACKETS[CLOSING_BRACKETS.indexOf(content)];

          for (let i = couples.length - 1; i >= 0; i -= 1) {
            const couple = couples[i];

            if (
              couple.length === 1 &&
              couple[0].token.content === openingBracket
            ) {
              couple.push({ offset, token });
              break;
            }
          }
        }
      });

      const neighborToken = couples
        .find((couple) => couple.some(({ token }) => token === tokenNearCursor))
        ?.find(({ token }) => token.content !== tokenNearCursor.content)?.token;

      if (neighborToken) {
        neighborToken.type = 'highlightedBracket';
      }
    }
  }
}

function getTokenLength(token: string | Token): number {
  if (typeof token === 'string') {
    return token.length;
  }
  if (Array.isArray(token.content)) {
    return token.content.reduce((sum, entry) => sum + getTokenLength(entry), 0);
  }
  return getTokenLength(token.content);
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
