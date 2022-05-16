import { CompletionItem } from '../CompletionItem';
import {
  getGlobalCompletionItems,
  getObjectsCompletionMap,
} from '../dictionary';

export function getCompletionItems(partialKeyword: string): {
  completionItems: CompletionItem[];
  correctedPartialKeyword: string;
} {
  let correctedPartialKeyword = partialKeyword;
  let completionItems = [] as CompletionItem[];

  if (partialKeyword.includes('.')) {
    const objectName = partialKeyword.split('.').slice(0, -1).join('.');
    const objectPartialProperty = partialKeyword.split('.').pop() as string;
    const objectsCompletionMap = getObjectsCompletionMap();

    if (objectsCompletionMap[objectName] !== undefined) {
      completionItems = objectsCompletionMap[objectName].filter(
        ({ keyword }) =>
          keyword.startsWith(objectPartialProperty) &&
          objectPartialProperty.length < keyword.length
      );
      correctedPartialKeyword = objectPartialProperty;
    }
  } else {
    completionItems =
      partialKeyword.length > 1
        ? getGlobalCompletionItems().filter(
            ({ keyword }) =>
              keyword.startsWith(partialKeyword) &&
              partialKeyword.length < keyword.length
          )
        : [];
  }

  return { completionItems, correctedPartialKeyword };
}
