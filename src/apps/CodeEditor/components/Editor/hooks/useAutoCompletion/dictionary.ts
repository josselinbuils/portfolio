import { INDENT } from '../../constants';
import { CompletionItem } from './CompletionItem';

export const CURSOR = '[CURSOR]';

const keywordItems = [
  ['break', 'break;'],
  ['catch', `catch (error) {${CURSOR}}`],
  ['case', `case ${CURSOR}:`],
  ['continue', 'continue;'],
  ['const', 'const '],
  ['debugger', 'debugger;'],
  ['delete', 'delete '],
  ['default', `default:\n${INDENT}`],
  ['do', `do {\n${INDENT}${CURSOR}\n} while();`],
  ['else', 'else '],
  ['false', 'false'],
  ['finally', `finally {\n${INDENT}${CURSOR}\n}`],
  ['for', `for (${CURSOR}) {\n${INDENT}\n}`],
  ['function', `function ${CURSOR}() {\n${INDENT}\n}`],
  ['if', `if (${CURSOR})`],
  ['instanceof', 'instanceof '],
  ['let', 'let '],
  ['new', 'new '],
  ['null', 'null'],
  ['return', 'return '],
  ['switch', `switch (${CURSOR}) {\n${INDENT}\n}`],
  ['this', 'this'],
  ['throw', 'throw'],
  ['true', 'true'],
  ['try', `try {\n${INDENT}${CURSOR}\n} catch (error) {}`],
  ['typeof', 'typeof '],
  ['undefined', 'undefined'],
  ['var', 'var '],
  ['void', 'void '],
  ['while', `while (${CURSOR}) {\n${INDENT}\n}`],
].map(([keyword, template]) => ({ keyword, template })) as CompletionItem[];

const globals = Object.getOwnPropertyNames(window)
  .sort()
  .filter(createPropFilter(window));
const globalItems = globals.map(createObjectMapper(window));

export const GLOBAL_COMPLETION_ITEMS = [...keywordItems, ...globalItems];

export const OBJECTS_COMPLETION_MAP = {} as { [key: string]: CompletionItem[] };

globals.forEach((name) => {
  const parent = (window as any)[name];
  const items = Object.getOwnPropertyNames(parent)
    .sort()
    .filter(createPropFilter(parent))
    .map(createObjectMapper(parent));

  if (items.length > 0) {
    OBJECTS_COMPLETION_MAP[name] = items;
  }
});

function createObjectMapper(obj: any): (keyword: string) => CompletionItem {
  return (keyword) => ({
    keyword,
    template:
      typeof obj[keyword] === 'function' && /^[^A-Z]/.test(keyword)
        ? `${keyword}(${CURSOR})`
        : keyword,
  });
}

function createPropFilter(parent: any): (name: string) => boolean {
  return (name) =>
    !!parent[name] &&
    /^[^A-Z_]/.test(name) &&
    !name.startsWith('webkit') &&
    !name.startsWith('webpack');
}
