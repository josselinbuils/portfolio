import cn from 'classnames';
import {
  type ChangeEvent,
  type FC,
  type JSX,
  type TargetedEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'preact/compat';
import { useTooltip } from '@/platform/components/Tooltip/useTooltip';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { cancelable } from '@/platform/utils/cancelable';
import { type ClientCursor } from '../../interfaces/ClientCursor';
import { type ClientState } from '../../interfaces/ClientState';
import { type CursorPosition } from '../../interfaces/CursorPosition';
import { type EditableState } from '../../interfaces/EditableState';
import { type EditorFile } from '../../interfaces/EditorFile';
import { type LintIssue } from '../../interfaces/LanguageService';
import { type Selection } from '../../interfaces/Selection';
import { createSelection } from '../../utils/createSelection';
import { getLanguageService } from '../../utils/getLanguageService';
import { highlightCode } from '../../utils/highlightCode/highlightCode';
import { spliceString } from '../../utils/spliceString';
import styles from './Editor.module.scss';
import { Cursor } from './components/Cursor/Cursor';
import { LineHighlight } from './components/LineHighlight/LineHighlight';
import { LineNumbers } from './components/LineNumbers/LineNumbers';
import { LintIssueHighlight } from './components/LintIssueHighlight/LintIssueHighlight';
import {
  type Completion,
  useAutoCompletion,
} from './hooks/useAutoCompletion/useAutoCompletion';
import { useHistory } from './hooks/useHistory';
import { useSharedFile } from './hooks/useSharedFile/useSharedFile';
import { autoEditChange } from './utils/autoEditChange/autoEditChange';
import { comment } from './utils/comment';
import { duplicate } from './utils/duplicate';
import { formatCode } from './utils/formatCode';
import { getLineBeforeCursor } from './utils/getLineBeforeCursor';
import { getLineIndent } from './utils/getLineIndent';
import { getLineNumber } from './utils/getLineNumber';
import { getWidthWithoutPadding } from './utils/getWidthWithoutPadding';
import { indent } from './utils/indent';
import { isCodePortionEnd } from './utils/isCodePortionEnd';
import { moveLines } from './utils/moveLines';
import { unindent } from './utils/unindent';

const TOOLTIP_DISPLAY_DELAY_MS = 500;

export interface EditorProps {
  activeFile: EditorFile;
  className?: string;
  code: string;
  onChange(code: string): void;
  onCursorPositionUpdate(cursorPosition: CursorPosition): void;
}

export const Editor: FC<EditorProps> = ({
  activeFile,
  className,
  code,
  onChange,
  onCursorPositionUpdate,
}) => {
  const [active, setActive] = useState(false);
  const [autoCompleteActive, setAutoCompleteActive] = useState(false);
  const [cursorColor, setCursorColor] = useState('#f0f0f0');
  const [cursors, setCursors] = useState<ClientCursor[]>([]);
  const [highlightedCode, setHighlightedCode] = useState<JSX.Element>();
  const [lintIssues, setLintIssues] = useState<LintIssue[]>([]);
  const [selection, setSelection] = useState<Selection>(() =>
    createSelection(0),
  );
  const [scrollTop, setScrollTop] = useState(0);
  const codeElementRef = useRef<HTMLDivElement>(null);
  const textAreaElementRef = useRef<HTMLTextAreaElement>(null);
  const cursorOffset = selection[0];
  const {
    complete,
    hasCompletionItems,
    menuElement: autoCompletionMenuElement,
  } = useAutoCompletion({
    active: autoCompleteActive,
    code,
    cursorOffset,
    lineIndent: getLineIndent(code, cursorOffset),
    menuClassName: styles.autoCompletionMenu,
    onCompletion: applyAutoCompletion,
    textAreaElement: textAreaElementRef.current as HTMLTextAreaElement,
  });
  const applyState = useCallback(
    (state: EditableState): void => {
      onChange(state.code);
      setSelection(state.selection);
    },
    [onChange],
  );
  const { pushState } = useHistory({
    active: !activeFile.shared,
    code,
    fileName: activeFile.name,
    selection,
    applyState,
  });
  const { updateClientState, updateSelection } = useSharedFile({
    active: activeFile.shared,
    applyClientState,
    code,
    filename: activeFile.name,
    selection,
  });
  const { hideTooltip, showTooltip, tooltipElement, tooltipRef } = useTooltip({
    className: styles.infoTooltip,
    relativePosition: 'bottom-right',
  });
  const tooltipTimeoutRef = useRef<number>();

  useKeyMap(
    {
      'Alt+Shift+ArrowDown': () => updateState(moveLines(code, selection, 1)),
      'Alt+Shift+ArrowUp': () => updateState(moveLines(code, selection, -1)),
      'CtrlCmd+:,CtrlCmd+/': () => updateState(comment(code, selection)),
      'CtrlCmd+D': () => updateState(duplicate(code, selection)),
      'CtrlCmd+S': format,
      Escape: () => {
        if (autoCompleteActive) {
          setAutoCompleteActive(false);
        }
      },
      'Shift+Tab': () => updateState(unindent(code, selection)),
      Tab: () => {
        if (hasCompletionItems) {
          complete();
        } else {
          updateState(indent(code, selection));
        }
      },
    },
    active,
  );

  useLayoutEffect(() => {
    applyState({
      code: activeFile.content,
      selection: createSelection(0),
    });
    if (textAreaElementRef.current !== null) {
      textAreaElementRef.current.focus();
    }
  }, [activeFile, applyState]);

  useLayoutEffect(() => {
    setHighlightedCode(
      highlightCode(
        code,
        activeFile.language,
        'react',
        selection[1] === selection[0] ? selection[0] : undefined,
      ),
    );
  }, [activeFile.language, code, selection]);

  useEffect(() => {
    setLintIssues([]);

    const languageService = getLanguageService(activeFile.language);
    const [debouncePromise, cancelDebouncePromise] = cancelable(
      new Promise<void>((resolve) => {
        setTimeout(resolve, 100);
      }),
    );

    debouncePromise.then(() => languageService.lint(code)).then(setLintIssues);

    return cancelDebouncePromise;
  }, [activeFile.language, code]);

  useEffect(() => {
    const x = getLineBeforeCursor(code, cursorOffset).length + 1;
    const y = getLineNumber(code, cursorOffset) + 1;
    onCursorPositionUpdate({ offset: cursorOffset, x, y });
  }, [code, cursorOffset, onCursorPositionUpdate]);

  useLayoutEffect(() => {
    const textAreaElement = textAreaElementRef.current;

    if (textAreaElement !== null) {
      const { selectionEnd, selectionStart } = textAreaElement;

      if (selectionStart !== selection[0] || selectionEnd !== selection[1]) {
        textAreaElement.setSelectionRange(selection[0], selection[1]);
      }
    }
  }, [code, selection, textAreaElementRef]);

  useLayoutEffect(() => {
    if (codeElementRef.current !== null) {
      codeElementRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  function applyAutoCompletion({
    completion,
    newCursorOffset,
  }: Completion): void {
    insertText(completion, newCursorOffset);
  }

  function applyClientState(state: ClientState): void {
    if (code !== state.code) {
      onChange(state.code);
    }
    if (cursorColor !== state.cursorColor) {
      setCursorColor(state.cursorColor);
    }
    if (
      selection[0] !== state.selection[0] ||
      selection[1] !== state.selection[1]
    ) {
      setSelection(state.selection);
    }
    if (cursors !== state.cursors) {
      setCursors(state.cursors);
    }
  }

  function disableAutoCompletion(): void {
    if (autoCompleteActive) {
      setAutoCompleteActive(false);
    }
  }

  async function format(): Promise<void> {
    try {
      const { language } = activeFile;
      const formatted = await formatCode(code, cursorOffset, language);

      if (formatted.code !== code) {
        if (activeFile.shared) {
          updateClientState(formatted);
        } else {
          updateState(formatted);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const newCode = event.currentTarget.value;
    const newCursorOffset = event.currentTarget.selectionStart;

    if (newCode.length > code.length) {
      const allowAutoComplete = isCodePortionEnd(code, cursorOffset);

      if (allowAutoComplete && !autoCompleteActive) {
        setAutoCompleteActive(true);
      }
    } else {
      disableAutoCompletion();
    }

    const currentState = { code, selection };
    const newState = autoEditChange(currentState, {
      code: newCode,
      selection: createSelection(newCursorOffset),
    });

    if (newState !== undefined) {
      updateState(newState);

      if (activeFile.shared) {
        // Mitigates that React issue https://github.com/facebook/react/issues/12762
        onChange(`${code} `);
      }
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (tooltipTimeoutRef.current !== undefined) {
      window.clearTimeout(tooltipTimeoutRef.current);
    }

    const highlightedElement = (
      Array.from(
        codeElementRef.current?.querySelectorAll('[data-offset]') ?? [],
      ) as HTMLElement[]
    )
      .filter((element) => element.firstElementChild === null)
      .find((element) => {
        const { offsetX, offsetY } = event;
        const { offsetHeight, offsetLeft, offsetWidth } = element;
        const offsetRight = offsetLeft + offsetWidth;
        const offsetTop = element.offsetTop - scrollTop;
        const offsetBottom = offsetTop + offsetHeight;

        return (
          offsetX >= offsetLeft &&
          offsetX <= offsetRight &&
          offsetY >= offsetTop &&
          offsetY <= offsetBottom
        );
      });

    if (highlightedElement !== undefined) {
      if (!tooltipElement) {
        tooltipTimeoutRef.current = window.setTimeout(async () => {
          const { clientX: x } = event;
          const { bottom: y } = highlightedElement.getBoundingClientRect();
          const languageService = getLanguageService(activeFile.language);
          const elementCursorOffset = Number(highlightedElement.dataset.offset);
          const quickInfo = await languageService.getQuickInfo(
            code,
            elementCursorOffset,
          );
          const elementIssues = lintIssues.filter(
            ({ start }) => start === elementCursorOffset,
          );

          if (quickInfo !== undefined) {
            showTooltip({
              position: { x, y },
              title: (
                <>
                  {elementIssues.map((issue) => (
                    <section className={styles.infoTooltipIssue}>
                      {issue.message}
                    </section>
                  ))}
                  {quickInfo}
                </>
              ),
            });
          }
        }, TOOLTIP_DISPLAY_DELAY_MS);
      }
    } else if (tooltipElement) {
      const clientRect = tooltipRef.current?.getBoundingClientRect();

      if (clientRect) {
        const { clientX, clientY } = event;
        const { left, top, right, bottom } = clientRect;

        if (
          clientX >= left &&
          clientX <= right &&
          clientY >= top &&
          clientY <= bottom
        ) {
          return; // Cursor on the tooltip
        }
      }
      hideTooltip();
    }
  }

  function handleSelect(event: TargetedEvent): void {
    if (!event.target) {
      return;
    }

    const { selectionEnd, selectionStart } =
      event.target as HTMLTextAreaElement;

    if (
      selectionEnd !== selectionStart ||
      !isCodePortionEnd(code, selectionStart)
    ) {
      setAutoCompleteActive(false);
    }

    if (selectionStart === selection[0] && selectionEnd === selection[1]) {
      return;
    }

    const newSelection = createSelection(selectionStart, selectionEnd);

    if (activeFile.shared) {
      updateSelection(newSelection);
    } else {
      setSelection(newSelection);
    }
  }

  function insertText(
    text: string,
    newCursorOffset: number = cursorOffset + text.length,
  ): void {
    updateState({
      code: spliceString(code, cursorOffset, 0, text),
      selection: createSelection(newCursorOffset),
    });
  }

  function updateState(newState: EditableState | undefined): void {
    if (newState === undefined) {
      return;
    }
    if (activeFile.shared) {
      updateClientState(newState);
    } else {
      pushState(newState);
      applyState(newState);
    }
  }

  return (
    <div className={cn(styles.editor, className)}>
      <LineNumbers
        className={styles.lineNumbers}
        code={code}
        editorWidth={getWidthWithoutPadding(textAreaElementRef.current)}
        scrollTop={scrollTop}
        selection={selection}
      />
      <div className={styles.code} onMouseMove={handleMouseMove}>
        <div className={styles.highlightedCode} ref={codeElementRef}>
          {highlightedCode}
        </div>
        <div className={styles.graphicalObjects}>
          {textAreaElementRef.current && (
            <>
              {activeFile.shared &&
                cursors.map((cursor) => (
                  <Cursor
                    code={code}
                    color={cursor.color}
                    key={cursor.clientID}
                    selection={cursor.selection}
                    parent={textAreaElementRef.current as HTMLTextAreaElement}
                  />
                ))}
              {lintIssues.map((issue) => (
                <LintIssueHighlight
                  code={code}
                  issue={issue}
                  parent={textAreaElementRef.current as HTMLTextAreaElement}
                />
              ))}
              <LineHighlight
                code={code}
                parent={textAreaElementRef.current as HTMLTextAreaElement}
                selection={selection}
              />
            </>
          )}
        </div>
        <textarea
          className={styles.textarea}
          onBlur={() => setActive(false)}
          onChange={handleChange}
          onClick={(event) => {
            // Waits for selectionEnd and selectionStart to be updated
            setTimeout(() => handleSelect(event), 0);
          }}
          onKeyDown={(event) => {
            // Waits for selectionEnd and selectionStart to be updated
            setTimeout(() => handleSelect(event), 0);
          }}
          onMouseDown={(event) => {
            disableAutoCompletion();
            // Waits for selectionEnd and selectionStart to be updated
            setTimeout(() => handleSelect(event), 0);
          }}
          onFocus={() => setActive(true)}
          onSelect={handleSelect}
          onScroll={({ target }) =>
            setScrollTop((target as HTMLTextAreaElement).scrollTop)
          }
          ref={textAreaElementRef}
          spellCheck={'false' as any}
          style={activeFile.shared ? { caretColor: cursorColor } : undefined}
          value={code}
        />
      </div>
      {autoCompletionMenuElement}
      {tooltipElement}
    </div>
  );
};
