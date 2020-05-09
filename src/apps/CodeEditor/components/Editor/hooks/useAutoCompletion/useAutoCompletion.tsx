import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { useDynamicRef } from '~/platform/hooks/useDynamicRef';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider/useContextMenu';
import { getCursorPosition } from '../../utils/getCursorPosition';
import { getLineBeforeCursor } from '../../utils/getLineBeforeCursor';
import { getCompletion } from './utils/getCompletion';
import { getCompletionItems } from './utils/getCompletionItems';

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
  const activeIndexRef = useRef(-1);
  const onCompletionRef = useDynamicRef(onCompletion);
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
  const completePropsRef = useDynamicRef({
    cursorOffset,
    lineIndent,
    onCompletion,
    partialKeyword,
  });

  useLayoutEffect(() => {
    if (textAreaElement) {
      const { completionItems, correctedPartialKeyword } = getCompletionItems(
        partialKeyword
      );

      if (completionItems.length > 0) {
        const cursorPosition = getCursorPosition(
          textAreaElement,
          cursorOffset - correctedPartialKeyword.length
        );
        const { x, y } = textAreaElement.getBoundingClientRect();

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
          onActivate: (index) => {
            activeIndexRef.current = index;
          },
          position: {
            x: x + cursorPosition.x,
            y: y + cursorPosition.y,
          },
        });

        return hideContextMenu;
      }
    }
  }, [
    cursorOffset,
    hideContextMenu,
    lineIndent,
    menuClassName,
    onCompletionRef,
    partialKeyword,
    showContextMenu,
    textAreaElement,
  ]);

  const complete = useCallback(() => {
    const completeProps = completePropsRef.current;
    const { completionItems, correctedPartialKeyword } = getCompletionItems(
      completeProps.partialKeyword
    );
    const completionItem = completionItems[activeIndexRef.current];

    if (completionItem !== undefined) {
      const { template } = completionItem;

      completeProps.onCompletion(
        getCompletion(
          template,
          completeProps.cursorOffset,
          correctedPartialKeyword,
          completeProps.lineIndent
        )
      );
    }
  }, [completePropsRef]);

  return { hasCompletionItems, complete };
}

export interface Completion {
  completion: string;
  newCursorOffset: number;
}
