import { useCallback, useLayoutEffect, useRef } from 'preact/compat';
import { useDynamicRef } from '@/platform/hooks/useDynamicRef';
import { useMenu } from '@/platform/providers/MenuProvider/useMenu';
import { getLineBeforeCursor } from '../../utils/getLineBeforeCursor';
import { getOffsetPosition } from '../../utils/getOffsetPosition';
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
  const { hideMenu, isMenuDisplayed: hasCompletionItems, showMenu } = useMenu();
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
      const { completionItems, correctedPartialKeyword } =
        getCompletionItems(partialKeyword);

      if (completionItems.length > 0) {
        const cursorPosition = getOffsetPosition(
          code,
          textAreaElement,
          cursorOffset - correctedPartialKeyword.length,
        );
        const { x, y } = textAreaElement.getBoundingClientRect();

        showMenu({
          className: menuClassName,
          enterWithTab: true,
          items: completionItems.map(({ displayName, template }) => ({
            onClick: () =>
              onCompletionRef.current(
                getCompletion(
                  template,
                  cursorOffset,
                  correctedPartialKeyword,
                  lineIndent,
                ),
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
            y: y + cursorPosition.y - textAreaElement.scrollTop,
          },
        });

        return hideMenu;
      }
    }
  }, [
    code,
    cursorOffset,
    hideMenu,
    lineIndent,
    menuClassName,
    onCompletionRef,
    partialKeyword,
    showMenu,
    textAreaElement,
  ]);

  const complete = useCallback(() => {
    const completeProps = completePropsRef.current;
    const { completionItems, correctedPartialKeyword } = getCompletionItems(
      completeProps.partialKeyword,
    );
    const completionItem = completionItems[activeIndexRef.current];

    if (completionItem !== undefined) {
      const { template } = completionItem;

      completeProps.onCompletion(
        getCompletion(
          template,
          completeProps.cursorOffset,
          correctedPartialKeyword,
          completeProps.lineIndent,
        ),
      );
    }
  }, [completePropsRef]);

  return { hasCompletionItems, complete };
}

export interface Completion {
  completion: string;
  newCursorOffset: number;
}
