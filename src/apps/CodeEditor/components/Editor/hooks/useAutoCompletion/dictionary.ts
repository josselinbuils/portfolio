import { CompletionItem } from './CompletionItem';

export const CURSOR = '[CURSOR]';

const KEYWORDS = [
  ['break', 'break;'],
  ['catch', `catch (error) {${CURSOR}}`],
  ['case', `case ${CURSOR}:`],
  ['continue', 'continue;'],
  ['const', 'const '],
  ['debugger', 'debugger;'],
  ['delete', 'delete '],
  ['default', 'default:\n  '],
  ['do', `do {\n  ${CURSOR}\n} while();`],
  ['else', 'else '],
  ['false', 'false'],
  ['finally', `finally {\n  ${CURSOR}\n}`],
  ['for', `for (${CURSOR}) {\n  \n}`],
  ['function', `function ${CURSOR}() {\n  \n}`],
  ['if', `if (${CURSOR})`],
  ['instanceof', 'instanceof '],
  ['let', 'let '],
  ['new', 'new '],
  ['null', 'null'],
  ['return', 'return '],
  ['switch', `switch (${CURSOR}) {\n  \n}`],
  ['this', 'this'],
  ['throw', 'throw'],
  ['true', 'true'],
  ['try', `try {\n  ${CURSOR}\n} catch (error) {}`],
  ['typeof', 'typeof '],
  ['undefined', 'undefined'],
  ['var', 'var '],
  ['void', 'void '],
  ['while', `while (${CURSOR}) {\n  \n}`],
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
