import { CompletionItem } from './CompletionItem';

export const CURSOR = '[CURSOR]';

const KEYWORDS = [
  ['const', 'const '],
  ['else', 'else '],
  ['false', 'false'],
  ['function', `function ${CURSOR}() {\n  \n}`],
  ['if', `if (${CURSOR})`],
  ['let', 'let '],
  ['new', 'new '],
  ['null', 'null'],
  ['return', 'return '],
  ['true', 'true'],
  ['undefined', 'undefined'],
].map(([keyword, template]) => ({ keyword, template })) as CompletionItem[];

const GLOBALS = Object.getOwnPropertyNames(window).map((keyword) =>
  mapObject(window, keyword)
);

export const GLOBAL_COMPLETION_ITEMS = [...KEYWORDS, ...GLOBALS];

export const OBJECTS_COMPLETION_MAP = {} as { [key: string]: CompletionItem[] };

Object.getOwnPropertyNames(window)
  .filter((name) => !!(window as any)[name])
  .forEach((name) => {
    OBJECTS_COMPLETION_MAP[name] = Object.getOwnPropertyNames(
      (window as any)[name]
    ).map((keyword) => mapObject((window as any)[name], keyword));
  });

function mapObject(obj: any, keyword: string): CompletionItem {
  return {
    keyword,
    template:
      typeof obj[keyword] === 'function' ? `${keyword}(${CURSOR})` : keyword,
  };
}
