import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider';
import { getCursorPosition, getLineBeforeCursor } from '../../utils';
import { getCompletion, getCompletionItems } from './utils';

export function useAutoCompletion({
  active,
  code,
  cursorOffset,
  lineIndent,
  menuClassName,
  onCompletion,
  textAreaElement,
}: {
  active: boolean;
  code: string;
  cursorOffset: number;
  lineIndent: number;
  menuClassName: string;
  textAreaElement: HTMLTextAreaElement | null;
  onCompletion(completion: Completion): void;
}): { hasCompletionItems: boolean; complete(): void } {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const onCompletionRef = useRef<(completion: Completion) => void>(
    onCompletion
  );
  const {
    hideContextMenu,
    isContextMenuDisplayed: hasCompletionItems,
    showContextMenu,
  } = useContextMenu();
  const partialKeyword = active
    ? (getLineBeforeCursor(code, cursorOffset)
        .split(/[ ([{]/)
        .pop() as string)
    : '';

  onCompletionRef.current = onCompletion;

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
              onCompletionRef.current(
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

      onCompletionRef.current(
        getCompletion(
          template,
          cursorOffset,
          correctedPartialKeyword,
          lineIndent
        )
      );
    }
  }, [activeIndex, cursorOffset, lineIndent, partialKeyword]);

  return { hasCompletionItems, complete };
}

export interface Completion {
  completion: string;
  newCursorOffset: number;
}
