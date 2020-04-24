import { faStream } from '@fortawesome/free-solid-svg-icons/faStream';
import cn from 'classnames';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.min';
import React, {
  ChangeEvent,
  FC,
  SyntheticEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useKeyMap } from '~/platform/hooks';
import { Toolbar, ToolButton } from '../../components';
import { LineNumbers } from './components';
import { END_WORD_CHARS, INDENT_SPACES } from './constants';
import { useAutoCompletion } from './hooks';
import {
  docExec,
  formatCode,
  getAutoCloseChar,
  getLineIndent,
  isAutoCloseChar,
  isIntoAutoCloseGroup,
  isIntoBrackets,
  isOpenBracket,
} from './utils';

import 'prismjs-darcula-theme/darcula.scss';
import styles from './Editor.module.scss';

export const Editor: FC<Props> = ({ className, code, onChange }) => {
  const [active, setActive] = useState(false);
  const [autoCompleteActive, setAutoCompleteActive] = useState(false);
  const [cursorOffset, setCursorOffset] = useState(0);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [lineCount, setLineCount] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const codeElementRef = useRef<HTMLDivElement>(null);
  const textAreaElementRef = useRef<HTMLTextAreaElement>(null);
  const { complete, hasCompletionItems } = useAutoCompletion({
    cursorOffset,
    lineIndent: getLineIndent(code, cursorOffset),
    menuClassName: styles.autoCompletionMenu,
    onCompletion: useCallback(({ completion, newCursorOffset }) => {
      docExec.insertText(completion);
      setCursorOffset(newCursorOffset);
    }, []),
    partialKeyword: autoCompleteActive
      ? code
          .slice(0, cursorOffset)
          .split(/[ ([]|(\${)/)
          .slice(-1)[0]
      : '',
    textAreaElement: textAreaElementRef.current,
  });

  useKeyMap(
    {
      Backspace: () => {
        if (isIntoAutoCloseGroup(code, cursorOffset)) {
          docExec.forwardDelete();
        }
        return false;
      },
      'Control+S,Meta+S': format,
      Enter: () => {
        if (hasCompletionItems) {
          return;
        }
        const indent = getLineIndent(code, cursorOffset);
        const indentSpaces = ' '.repeat(indent);
        const additionalSpaces =
          isOpenBracket(code[cursorOffset - 1]) ||
          code[cursorOffset - 1] === ':'
            ? INDENT_SPACES
            : '';

        if (isIntoBrackets(code, cursorOffset)) {
          docExec.insertText(
            `\n${indentSpaces}${additionalSpaces}\n${indentSpaces}`
          );
          setCursorOffset(cursorOffset + indent + 3);
        } else {
          docExec.insertText(`\n${indentSpaces}${additionalSpaces}`);
        }
      },
      Tab: () => {
        if (hasCompletionItems) {
          complete();
        } else {
          docExec.insertText(INDENT_SPACES);
        }
      },
    },
    active
  );

  useLayoutEffect(() => {
    const highlighted = Prism.highlight(
      code,
      Prism.languages.javascript,
      'javascript'
    );

    setHighlightedCode(
      highlighted.slice(-1) === '\n' ? `${highlighted} ` : highlighted
    );
    setLineCount((code.match(/\n/g)?.length || 0) + 1);
    (textAreaElementRef.current as HTMLTextAreaElement).scrollTop = 1e10;
  }, [code]);

  useLayoutEffect(() => {
    const textAreaElement = textAreaElementRef.current;

    if (textAreaElement !== null) {
      const { selectionEnd, selectionStart } = textAreaElement;

      if (selectionEnd === selectionStart && selectionStart !== cursorOffset) {
        textAreaElement.selectionStart = cursorOffset;
        textAreaElement.selectionEnd = cursorOffset;
      }
    }
  }, [cursorOffset]);

  useLayoutEffect(() => {
    if (codeElementRef.current !== null) {
      codeElementRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  function format(): void {
    try {
      const formatted = formatCode(code, cursorOffset);
      onChange(formatted.code);
      setCursorOffset(formatted.cursorOffset);
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(event: ChangeEvent): void {
    const { value } = event.target as HTMLTextAreaElement;

    onChange(value);

    if (value.length > code.length) {
      const diff = value
        .replace(code.slice(0, cursorOffset), '')
        .replace(code.slice(cursorOffset), '');
      const autoCloseChar = getAutoCloseChar(diff);

      if (autoCloseChar !== undefined) {
        docExec.insertText(autoCloseChar);
        setCursorOffset(cursorOffset + 1);
      } else if (
        isIntoAutoCloseGroup(code, cursorOffset) &&
        isAutoCloseChar(diff)
      ) {
        docExec.forwardDelete();
      }

      if (END_WORD_CHARS.includes(value[cursorOffset + 1])) {
        setAutoCompleteActive(true);
      }
    } else if (autoCompleteActive) {
      setAutoCompleteActive(false);
    }
  }

  function handleSelect({ target }: SyntheticEvent): void {
    const newCursorOffset = (target as HTMLTextAreaElement).selectionStart;

    if (!END_WORD_CHARS.includes(code[newCursorOffset])) {
      setAutoCompleteActive(false);
    }
    setCursorOffset(newCursorOffset);
  }

  return (
    <div className={cn(styles.editor, className)}>
      <LineNumbers
        className={styles.lineNumbers}
        lineCount={lineCount}
        scrollTop={scrollTop}
      />
      <div
        className={styles.code}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        ref={codeElementRef}
      />
      <textarea
        className={styles.textarea}
        onBlur={() => setActive(false)}
        onChange={handleChange}
        onFocus={() => setActive(true)}
        onScroll={({ target }) =>
          setScrollTop((target as HTMLTextAreaElement).scrollTop)
        }
        onSelect={handleSelect}
        ref={textAreaElementRef}
        spellCheck={false}
        value={code}
      />
      <Toolbar className={styles.toolbar}>
        <ToolButton
          icon={faStream}
          onClick={format}
          title={
            <>
              Format&nbsp;<kbd>Ctrl</kbd>+<kbd>S</kbd>
            </>
          }
        />
      </Toolbar>
    </div>
  );
};

interface Props {
  className?: string;
  code: string;
  onChange(code: string): void;
}
