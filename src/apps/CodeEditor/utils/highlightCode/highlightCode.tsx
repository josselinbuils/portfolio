import { type JSX } from 'preact/compat';
import Prism, { Token } from 'prismjs';
import 'prismjs/components/prism-css.min';
import 'prismjs/components/prism-javascript.min';
import 'prismjs/components/prism-json.min';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-markdown.min';
import 'prismjs/components/prism-markup-templating.min';
import 'prismjs/components/prism-markup.min';
import 'prismjs/components/prism-scss.min';
import 'prismjs/components/prism-tsx.min';
import 'prismjs/components/prism-typescript.min';
import 'prismjs/components/prism-yaml.min';
import styles from './manomano.module.scss';

const CLOSING_BRACKETS = [')', ']', '}'];
const OPENING_BRACKETS = ['(', '[', '{'];
const BRACKETS = [...OPENING_BRACKETS, ...CLOSING_BRACKETS];

interface ProcessedToken extends Token {
  content: string | ProcessedToken | (string | ProcessedToken)[];
  offset: number;
}

export function highlightCode(
  code: string,
  language: string,
  outputFormat: 'html',
  cursorOffset?: number,
): string;

export function highlightCode(
  code: string,
  language: string,
  outputFormat: 'react',
  cursorOffset?: number,
): JSX.Element;

export function highlightCode(
  code: string,
  language: string,
  outputFormat: 'html' | 'react',
  cursorOffset?: number,
): string | JSX.Element {
  if (Prism.languages[language] === undefined) {
    return outputFormat === 'html' ? escapeHtml(code) : <>{escapeHtml(code)}</>;
  }

  const elements = processElements(
    Prism.tokenize(code, Prism.languages[language]),
    cursorOffset,
  );

  const highlighted = stringify(elements);
  const endWithEmptyLine = highlighted.slice(-1) === '\n';

  if (outputFormat === 'html') {
    return endWithEmptyLine ? `${highlighted} ` : highlighted;
  }
  return reactify(endWithEmptyLine ? [...elements, ' '] : elements);
}

function addOffsets(elements: (string | Token)[], offset = 0): void {
  elements.forEach((element) => {
    const isToken = typeof element !== 'string';

    if (isToken) {
      (element as any).offset = offset;

      if (Array.isArray(element.content)) {
        addOffsets(element.content, offset);
      }
    }
    offset += getTokenLength(element);
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

function processElements(
  rawElements: (string | Token)[],
  cursorOffset: number | undefined,
): (string | ProcessedToken)[] {
  // Converts missing tokens
  const elements = rawElements
    .map((token) =>
      typeof token === 'string' && /[a-zA-Z0-9]+/.test(token)
        ? (token
            .split('')
            .map((part) => {
              if (/^[a-zA-Z0-9]+$/.test(part)) {
                return new Token('other', part);
              }
              return part;
            })
            .map((part, index, array) => {
              const nextPart = array[index + 1];

              if (part instanceof Token && nextPart instanceof Token) {
                nextPart.content = `${part.content}${nextPart.content}`;
                return undefined;
              }
              return part;
            })
            .filter(Boolean) as (string | Token)[])
        : token,
    )
    .flat();

  addOffsets(elements);

  const tokens = elements.filter(
    (token): token is ProcessedToken => typeof token !== 'string',
  );

  walk(tokens, (token) => {
    // Fixes keywords
    if (token.content === ';') {
      token.type = 'keyword';
    }

    // Fixes builtins
    if (
      token.type === 'builtin' &&
      ['Array', 'Function', 'Promise', 'console'].includes(
        token.content as string,
      )
    ) {
      token.type = 'other';
    }
  });

  if (cursorOffset !== undefined) {
    const bracketNearCursor = tokens.find(
      (token) =>
        BRACKETS.includes(token.content as string) &&
        [cursorOffset, cursorOffset - 1].includes((token as any).offset),
    );

    if (bracketNearCursor !== undefined) {
      bracketNearCursor.type = 'highlightedBracket';

      const couples: ProcessedToken[][] = [];

      tokens.forEach((token) => {
        const content = token.content as string;

        if (OPENING_BRACKETS.includes(content)) {
          couples.push([token]);
        } else if (CLOSING_BRACKETS.includes(content)) {
          const openingBracket =
            OPENING_BRACKETS[CLOSING_BRACKETS.indexOf(content)];

          for (let i = couples.length - 1; i >= 0; i -= 1) {
            const couple = couples[i];

            if (couple.length === 1 && couple[0].content === openingBracket) {
              couple.push(token);
              break;
            }
          }
        }
      });

      const neighborToken = couples
        .find((couple) => couple.some((token) => token === bracketNearCursor))
        ?.find((token) => token.content !== bracketNearCursor.content);

      if (neighborToken) {
        neighborToken.type = 'highlightedBracket';
      }
    }
  }

  return elements as (string | ProcessedToken)[];
}

function reactify(
  input: string | ProcessedToken | (string | ProcessedToken)[],
): string | JSX.Element {
  if (typeof input === 'string') {
    return input;
  }
  if (Array.isArray(input)) {
    return <>{input.map((element) => reactify(element))}</>;
  }

  const { content, offset, type } = input;

  return (
    <span
      className={styles[type]}
      data-offset={
        ['builtin', 'class-name', 'function', 'other'].includes(type)
          ? offset
          : undefined
      }
      key={`${type}-${offset}`}
    >
      {reactify(content)}
    </span>
  );
}

function stringify(
  input: string | ProcessedToken | (string | ProcessedToken)[],
): string {
  if (typeof input === 'string') {
    return Prism.util.encode(input) as string;
  }
  if (Array.isArray(input)) {
    return input.map((element) => stringify(element)).join('');
  }

  const { content, type } = input;

  return styles[type]
    ? `<span class="${styles[type]}">${stringify(content)}</span>`
    : stringify(content);
}

function walk(
  elements: (string | Token)[],
  callback: (token: Token) => unknown,
): void {
  elements
    .filter((element): element is Token => typeof element !== 'string')
    .forEach((token) => {
      callback(token);

      if (Array.isArray(token.content)) {
        walk(token.content, callback);
      } else if (typeof token.content !== 'string') {
        callback(token.content);
      }
    });
}
