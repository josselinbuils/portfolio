import { INDENT } from '../../constants';
import { CompletionItem } from './CompletionItem';

export const CURSOR = '[CURSOR]';
const KEYWORD_ITEMS = [
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
];

let globalCompletionItems: CompletionItem[];
let objectCompletionMap: { [key: string]: CompletionItem[] };

export function getGlobalCompletionItems(): CompletionItem[] {
  if (globalCompletionItems === undefined) {
    const keywordItems = KEYWORD_ITEMS.map(([keyword, template]) => ({
      displayName: keyword,
      keyword,
      template,
    })) as CompletionItem[];

    const globalItems = Object.getOwnPropertyNames(window)
      .sort()
      .filter((name) => !!(window as any)[name] && isNativeProp(name))
      .map(createObjectMapper(window));

    globalCompletionItems = [...keywordItems, ...globalItems];
  }
  return globalCompletionItems;
}

export function getObjectsCompletionMap(): { [key: string]: CompletionItem[] } {
  if (objectCompletionMap === undefined) {
    let antiCircularCache = [] as any[];

    objectCompletionMap = {};

    mapObject('', window);

    antiCircularCache = [];

    mapObject('window', window);

    // Forces garbage collection
    antiCircularCache.length = 0;

    function mapObject(path: string, obj: any): void {
      if (
        isFunction(obj) ||
        isPrimitive(obj) ||
        antiCircularCache.includes(obj)
      ) {
        return;
      }
      antiCircularCache.push(obj);

      try {
        const items = Object.getOwnPropertyNames(obj)
          .filter(createPropFilter(obj))
          .sort()
          .map(createObjectMapper(obj));

        items.forEach(({ keyword }) =>
          mapObject(`${path && `${path}.`}${keyword}`, obj[keyword])
        );

        if (path.length > 0 && items.length > 0) {
          objectCompletionMap[path] = items;
        }
      } catch (error) {}
    }
  }
  return objectCompletionMap;
}

function createObjectMapper(obj: any): (keyword: string) => CompletionItem {
  return (keyword) => {
    const isFunc = isFunction(obj[keyword]);

    return {
      displayName: isFunc ? `${keyword}()` : keyword,
      keyword,
      template: isFunc ? `${keyword}(${CURSOR})` : keyword,
    };
  };
}

function createPropFilter(parent: any): (name: string) => boolean {
  // eslint-disable-next-line no-new-func
  const blackList = Object.getOwnPropertyNames(new Function());

  return (name) => {
    const prop = parent[name];

    return (
      !!prop &&
      !blackList.includes(name) &&
      (typeof prop !== 'function' ||
        /^[^A-Z]/.test(name) ||
        hasStatics(prop, blackList)) &&
      isNativeProp(name)
    );
  };
}

function hasStatics(func: Function, blackList: string[]): boolean {
  return (
    Object.getOwnPropertyNames(func).filter((key) => !blackList.includes(key))
      .length > 0
  );
}

function isFunction(value: any): boolean {
  return typeof value === 'function' && /^[^A-Z]/.test(value.name);
}

function isNativeProp(name: string): boolean {
  return (
    !name.startsWith('_') &&
    !name.startsWith('FontAwesome') &&
    !name.startsWith('Prism') &&
    !name.startsWith('regeneratorRuntime') &&
    !name.startsWith('webkit') &&
    !name.startsWith('webpack')
  );
}

function isPrimitive(value: any): boolean {
  const type = typeof value;
  return (
    value === null ||
    value === undefined ||
    (type !== 'object' && type !== 'function')
  );
}
