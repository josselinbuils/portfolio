import { INDENT } from '../../constants';
import { CompletionItem } from './CompletionItem';

export const CURSOR = '[CURSOR]';
export const GLOBAL_COMPLETION_ITEMS = getGlobalCompletionItems();
export const OBJECTS_COMPLETION_MAP = {} as { [key: string]: CompletionItem[] };

fillObjectsCompletionMap();

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

function fillObjectsCompletionMap(): void {
  let antiCircularCache = [] as any[];

  mapObject('', window);

  antiCircularCache = [];

  mapObject('window', window);

  // Forces garbage collection
  antiCircularCache.length = 0;

  function isPrimitive(value: any): boolean {
    const type = typeof value;
    return (
      value === null ||
      value === undefined ||
      (type !== 'object' && type !== 'function')
    );
  }

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
        OBJECTS_COMPLETION_MAP[path] = items;
      }
    } catch (error) {}
  }
}

function getGlobalCompletionItems(): CompletionItem[] {
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
  ].map(([keyword, template]) => ({
    displayName: keyword,
    keyword,
    template,
  })) as CompletionItem[];

  const globalItems = Object.getOwnPropertyNames(window)
    .sort()
    .filter((name) => !!(window as any)[name] && isNativeProp(name))
    .map(createObjectMapper(window));

  return [...keywordItems, ...globalItems];
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
