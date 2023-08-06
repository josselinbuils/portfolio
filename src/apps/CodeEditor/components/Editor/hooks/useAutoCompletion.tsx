import { type JSX, useCallback, useEffect, useRef } from 'preact/compat';
import { type SupportedLanguage } from '@/apps/CodeEditor/interfaces/SupportedLanguage';
import { getLanguageService } from '@/apps/CodeEditor/utils/getLanguageService';
import { useMenu } from '@/platform/components/Menu/useMenu';
import { useDynamicRef } from '@/platform/hooks/useDynamicRef';
import { cancelable } from '@/platform/utils/cancelable';
import { getOffsetPosition } from '../utils/getOffsetPosition';

export interface Completion {
  completion: string;
  newCursorOffset: number;
}

export function useAutoCompletion({
  active,
  code,
  cursorOffset,
  language,
  lineIndent,
  menuClassName,
  onCompletion,
  textAreaElement,
}: {
  active: boolean;
  code: string;
  cursorOffset: number;
  language: SupportedLanguage;
  lineIndent: number;
  menuClassName: string;
  textAreaElement: HTMLTextAreaElement | null;
  onCompletion(completion: Completion): void;
}): {
  complete(): void;
  hasCompletionItems: boolean;
  menuElement: JSX.Element | null;
} {
  const activeIndexRef = useRef(-1);
  const onCompletionRef = useDynamicRef(onCompletion);
  const {
    hideMenu,
    isMenuDisplayed: hasCompletionItems,
    menuElement,
    showMenu,
  } = useMenu();
  const completePropsRef = useDynamicRef({
    cursorOffset,
    lineIndent,
    onCompletion,
  });

  useEffect(() => {
    if (!active || !textAreaElement) {
      hideMenu();
      return;
    }

    const languageService = getLanguageService(language);
    const [completionsPromise, cancelCompletionsPromise] = cancelable(
      Promise.resolve(languageService.getCompletions(code, cursorOffset)),
    );

    completionsPromise.then((completions) => {
      if (completions === undefined) {
        hideMenu();
        return;
      }

      const cursorPosition = getOffsetPosition(
        code,
        textAreaElement,
        completions.startOffset,
      );
      const { x, y } = textAreaElement.getBoundingClientRect();

      showMenu({
        className: menuClassName,
        enterWithTab: true,
        items: completions.items.map(
          ({ cursorOffsetInValue, name, value }) => ({
            onClick: () =>
              onCompletionRef.current({
                completion: value
                  .slice(cursorOffset - completions.startOffset)
                  .replace(/\n/g, `\n${' '.repeat(lineIndent)}`),
                newCursorOffset:
                  completions.startOffset +
                  (cursorOffsetInValue ?? value.length),
              }),
            title: (
              <>
                <mark>{code.slice(completions.startOffset, cursorOffset)}</mark>
                {name.slice(cursorOffset - completions.startOffset)}
              </>
            ),
          }),
        ),
        makeFirstItemActive: true,
        onActivate: (index) => {
          activeIndexRef.current = index;
        },
        position: {
          x: x + cursorPosition.x,
          y: y + cursorPosition.y - textAreaElement.scrollTop,
        },
      });
    });

    return cancelCompletionsPromise;
  }, [
    active,
    code,
    cursorOffset,
    hideMenu,
    language,
    lineIndent,
    menuClassName,
    onCompletionRef,
    showMenu,
    textAreaElement,
  ]);

  const complete = useCallback(async () => {
    const completeProps = completePropsRef.current;
    const languageService = getLanguageService(language);
    const completions = await languageService.getCompletions(
      code,
      completeProps.cursorOffset,
    );

    if (completions === undefined) {
      return;
    }
    const completionItem = completions.items[activeIndexRef.current];

    if (completionItem !== undefined) {
      const { cursorOffsetInValue, value } = completionItem;

      completeProps.onCompletion({
        completion: value
          .slice(completeProps.cursorOffset - completions.startOffset)
          .replace(/\n/g, `\n${' '.repeat(completeProps.lineIndent)}`),
        newCursorOffset:
          completions.startOffset + (cursorOffsetInValue ?? value.length),
      });
    }
  }, [code, completePropsRef, language]);

  return { complete, hasCompletionItems, menuElement };
}
