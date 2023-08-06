import { INDENT } from '../../constants';
import { type CompletionItem } from '../../interfaces/LanguageService';

export const CURSOR = '[CURSOR]';

const completionTemplateMap: Record<string, string> = {
  break: 'break;',
  catch: `catch (${CURSOR})`,
  case: `case ${CURSOR}:`,
  continue: 'continue;',
  const: 'const ',
  debugger: 'debugger;',
  delete: 'delete ',
  default: `default:\n${INDENT}`,
  do: `do {\n${INDENT}${CURSOR}\n}`,
  else: `else `,
  finally: `finally {\n${INDENT}${CURSOR}\n}`,
  for: `for (${CURSOR})`,
  function: `function ${CURSOR}() {\n${INDENT}\n}`,
  if: `if (${CURSOR})`,
  instanceof: 'instanceof ',
  let: 'let ',
  new: 'new ',
  return: 'return ',
  switch: `switch (${CURSOR}) {\n${INDENT}\n}`,
  throw: 'throw ',
  try: `try {\n${INDENT}${CURSOR}\n}`,
  typeof: 'typeof ',
  var: 'var ',
  void: 'void ',
  while: `while (${CURSOR})`,
};

export function decorateCompletionItem(
  completionItem: CompletionItem,
): CompletionItem {
  const { name } = completionItem;
  const template = Object.hasOwn(completionTemplateMap, name)
    ? completionTemplateMap[name]
    : undefined;

  if (template !== undefined) {
    const cursorOffsetInValue = template.includes(CURSOR)
      ? template.indexOf(CURSOR)
      : undefined;

    return {
      cursorOffsetInValue,
      name,
      value: template.replace(CURSOR, ''),
    };
  }
  return completionItem;
}
