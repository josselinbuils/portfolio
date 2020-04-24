import React, { useCallback, useLayoutEffect, useState } from 'react';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider';
import { getCursorPosition } from '../../utils';
import { CompletionItem } from './CompletionItem';
import {
  CURSOR,
  GLOBAL_COMPLETION_ITEMS,
  OBJECTS_COMPLETION_MAP,
} from './dictionary';

export function useAutoCompletion({
  cursorOffset,
  lineIndent,
  menuClassName,
  onCompletion,
  partialKeyword,
  textAreaElement,
}: {
  cursorOffset: number;
  lineIndent: number;
  menuClassName: string;
  partialKeyword: string;
  textAreaElement: HTMLTextAreaElement | null;
  onCompletion(completion: Completion): void;
}): { hasCompletionItems: boolean; complete(): void } {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const {
    hideContextMenu,
    isContextMenuDisplayed,
    showContextMenu,
  } = useContextMenu();

  useLayoutEffect(() => {
    if (textAreaElement) {
      const { completionItems, correctedPartialKeyword } = getCompletionItems(
        partialKeyword
      );

      if (completionItems.length > 0) {
        showContextMenu({
          className: menuClassName,
          items: completionItems.map(({ keyword, template }) => ({
            onClick: () =>
              onCompletion(
                getCompletion(
                  template,
                  cursorOffset,
                  correctedPartialKeyword,
                  lineIndent
                )
              ),
            title: (
              <>
                <mark>{correctedPartialKeyword}</mark>
                {keyword.slice(correctedPartialKeyword.length)}
              </>
            ),
          })),
          makeFirstItemActive: true,
          onActivate: setActiveIndex,
          position: getCursorPosition(
            textAreaElement,
            cursorOffset - correctedPartialKeyword.length
          ),
        });

        return hideContextMenu;
      }
    }
  }, [
    cursorOffset,
    hideContextMenu,
    lineIndent,
    menuClassName,
    onCompletion,
    partialKeyword,
    showContextMenu,
    textAreaElement,
  ]);

  return {
    hasCompletionItems: isContextMenuDisplayed,
    complete: useCallback(() => {
      const { completionItems, correctedPartialKeyword } = getCompletionItems(
        partialKeyword
      );
      const completionItem = completionItems[activeIndex];

      if (completionItem !== undefined) {
        const { template } = completionItem;

        onCompletion(
          getCompletion(
            template,
            cursorOffset,
            correctedPartialKeyword,
            lineIndent
          )
        );
      }
    }, [activeIndex, cursorOffset, lineIndent, onCompletion, partialKeyword]),
  };
}

function getCompletion(
  template: string,
  cursorOffset: number,
  partialKeyword: string,
  lineIndent: number
): { completion: string; newCursorOffset: number } {
  const cursorOffsetInTemplate = template.indexOf(CURSOR);

  const newCursorOffset =
    cursorOffset -
    partialKeyword.length +
    (cursorOffsetInTemplate !== -1 ? cursorOffsetInTemplate : template.length);

  const completion = template
    .slice(partialKeyword.length)
    .replace(CURSOR, '')
    .replace(/\n/g, `\n${' '.repeat(lineIndent)}`);

  return { completion, newCursorOffset };
}

function getCompletionItems(
  partialKeyword: string
): { completionItems: CompletionItem[]; correctedPartialKeyword: string } {
  let correctedPartialKeyword = partialKeyword;
  let completionItems = [] as CompletionItem[];

  if (/^[^.]{2,}\.[^.]*$/.test(partialKeyword)) {
    const [objectName, objectPartialProperty = ''] = partialKeyword.split('.');

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

interface Completion {
  completion: string;
  newCursorOffset: number;
}
