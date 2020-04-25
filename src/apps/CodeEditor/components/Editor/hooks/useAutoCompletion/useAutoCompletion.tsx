import React, { useCallback, useLayoutEffect, useState } from 'react';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider';
import { getCursorPosition } from '../../utils';
import { getCompletion, getCompletionItems } from './utils';

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
    isContextMenuDisplayed: hasCompletionItems,
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
          items: completionItems.map(({ displayName, template }) => ({
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
                {displayName.slice(correctedPartialKeyword.length)}
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

  const complete = useCallback(() => {
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
  }, [activeIndex, cursorOffset, lineIndent, onCompletion, partialKeyword]);

  return { hasCompletionItems, complete };
}

interface Completion {
  completion: string;
  newCursorOffset: number;
}
