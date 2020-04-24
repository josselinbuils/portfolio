import React, { useCallback, useLayoutEffect } from 'react';
import { getCursorPosition } from '~/apps/CodeEditor/components/Editor/utils';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider';

const CURSOR = '[CURSOR]';
export const AUTO_COMPLETION_ITEMS = [
  { keyword: 'const', template: 'const ' },
  { keyword: 'else', template: 'else ' },
  { keyword: 'false', template: 'false' },
  { keyword: 'function', template: `function ${CURSOR}() {\n  \n}` },
  { keyword: 'if', template: `if (${CURSOR})` },
  { keyword: 'let', template: 'let ' },
  { keyword: 'return', template: 'return ' },
  { keyword: 'true', template: 'true' },
] as CompletionItem[];

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
  const {
    hideContextMenu,
    isContextMenuDisplayed,
    showContextMenu,
  } = useContextMenu();

  useLayoutEffect(() => {
    if (textAreaElement) {
      const completionItems =
        partialKeyword.length > 1
          ? AUTO_COMPLETION_ITEMS.filter(({ keyword }) =>
              keyword.startsWith(partialKeyword)
            )
          : [];

      if (completionItems.length > 0) {
        showContextMenu({
          className: menuClassName,
          items: completionItems.map(({ keyword, template }) => ({
            onClick: () =>
              onCompletion(
                getCompletion(
                  template,
                  cursorOffset,
                  partialKeyword,
                  lineIndent
                )
              ),
            title: (
              <>
                <mark>{partialKeyword}</mark>
                {keyword.slice(partialKeyword.length)}
              </>
            ),
          })),
          makeFirstItemActive: true,
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
      const completionItem = AUTO_COMPLETION_ITEMS.find(({ keyword }) =>
        keyword.startsWith(partialKeyword)
      );

      if (completionItem !== undefined) {
        const { template } = completionItem;

        onCompletion(
          getCompletion(template, cursorOffset, partialKeyword, lineIndent)
        );
      }
    }, [cursorOffset, lineIndent, onCompletion, partialKeyword]),
  };
}

interface CompletionItem {
  keyword: string;
  template: string;
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

interface Completion {
  completion: string;
  newCursorOffset: number;
}
