import { CompletionItem } from '../CompletionItem';
import { GLOBAL_COMPLETION_ITEMS, OBJECTS_COMPLETION_MAP } from '../dictionary';

export function getCompletionItems(
  partialKeyword: string
): { completionItems: CompletionItem[]; correctedPartialKeyword: string } {
  let correctedPartialKeyword = partialKeyword;
  let completionItems = [] as CompletionItem[];

  if (partialKeyword.includes('.')) {
    const objectName = partialKeyword.split('.').slice(0, -1).join('.');
    const objectPartialProperty = partialKeyword.split('.').pop() as string;

    if (OBJECTS_COMPLETION_MAP[objectName] !== undefined) {
      completionItems = OBJECTS_COMPLETION_MAP[
        objectName
      ].filter(({ keyword }) => keyword.startsWith(objectPartialProperty));
      correctedPartialKeyword = objectPartialProperty;
    }
  } else {
    completionItems =
      partialKeyword.length > 1
        ? GLOBAL_COMPLETION_ITEMS.filter(({ keyword }) =>
            keyword.startsWith(partialKeyword)
          )
        : [];
  }

  return { completionItems, correctedPartialKeyword };
}
