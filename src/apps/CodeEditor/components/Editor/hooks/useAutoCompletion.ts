import { useLayoutEffect } from 'react';
import { getCursorPosition } from '~/apps/CodeEditor/components/Editor/utils';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider';

export const AUTO_COMPLETION_ITEMS = [
  { keyword: 'const', template: 'const' },
  { keyword: 'false', template: 'false' },
  { keyword: 'function', template: 'function ' },
  { keyword: 'let', template: 'let ' },
  { keyword: 'return', template: 'return ' },
  { keyword: 'true', template: 'true' },
] as CompletionItem[];

export function useAutoCompletion({
  cursorOffset,
  menuClassName,
  onCompletion,
  partialKeyword,
  textAreaElement,
}: {
  cursorOffset: number;
  menuClassName: string;
  partialKeyword: string;
  textAreaElement: HTMLTextAreaElement | null;
  onCompletion(completion: string): void;
}): boolean {
  const {
    hideContextMenu,
    isContextMenuDisplayed,
    showContextMenu,
  } = useContextMenu();

  useLayoutEffect(() => {
    if (textAreaElement) {
      const completionItems =
        partialKeyword.length > 1
          ? AUTO_COMPLETION_ITEMS.filter(
              ({ keyword }) =>
                keyword.length > partialKeyword.length &&
                keyword.startsWith(partialKeyword)
            )
          : [];

      if (completionItems.length > 0) {
        showContextMenu({
          className: menuClassName,
          items: completionItems.map(({ keyword, template }) => ({
            onClick: () => onCompletion(template.slice(partialKeyword.length)),
            title: keyword,
          })),
          position: getCursorPosition(
            textAreaElement,
            cursorOffset - partialKeyword.length
          ),
        });

        return hideContextMenu;
      }
    }
  }, [
    cursorOffset,
    hideContextMenu,
    menuClassName,
    onCompletion,
    partialKeyword,
    showContextMenu,
    textAreaElement,
  ]);

  return isContextMenuDisplayed;
}

interface CompletionItem {
  keyword: string;
  template: string;
}
