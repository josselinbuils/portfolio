import { faStream } from '@fortawesome/free-solid-svg-icons/faStream';
import cn from 'classnames';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.min';
import React, {
  ChangeEvent,
  FC,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Toolbar, ToolButton } from '~/apps/CodeEditor/components';
import { useKeyMap } from '~/platform/hooks';
import { LineNumbers } from './components';
import { AUTO_COMPLETION_KEYS, INDENT_SPACES } from './constants';
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
  const [cursorPosition, setCursorPosition] = useState(0);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [lineCount, setLineCount] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const codeElementRef = useRef<HTMLDivElement>(null);
  const textAreaElementRef = useRef<HTMLTextAreaElement>(null);

  useKeyMap(
    {
      Backspace: () => {
        if (isIntoAutoCloseGroup(code, cursorPosition)) {
          docExec.forwardDelete();
        }
        return false;
      },
      'Control+S,Meta+S': format,
      Enter: () => {
        const indent = getLineIndent(code, cursorPosition);
        const indentSpaces = ' '.repeat(indent);
        const additionalSpaces = isOpenBracket(code[cursorPosition - 1])
          ? INDENT_SPACES
          : '';

        if (isIntoBrackets(code, cursorPosition)) {
          docExec.insertText(
            `\n${indentSpaces}${additionalSpaces}\n${indentSpaces}`
          );
          setCursorPosition(cursorPosition + indent + 3);
        } else {
          docExec.insertText(`\n${indentSpaces}${additionalSpaces}`);
        }
      },
      Tab: () => {
        const partial = code.slice(0, cursorPosition).split(' ').slice(-1)[0];
        const keyword =
          partial.length > 1
            ? AUTO_COMPLETION_KEYS.find((key) => key.startsWith(partial))
            : undefined;

        docExec.insertText(
          keyword !== undefined ? keyword.slice(partial.length) : INDENT_SPACES
        );
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

      if (
        selectionEnd === selectionStart &&
        selectionStart !== cursorPosition
      ) {
        textAreaElement.selectionStart = cursorPosition;
        textAreaElement.selectionEnd = cursorPosition;
      }
    }
  }, [cursorPosition]);

  useLayoutEffect(() => {
    if (codeElementRef.current !== null) {
      codeElementRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  function format(): void {
    try {
      const formatted = formatCode(code, cursorPosition);
      onChange(formatted.code);
      setCursorPosition(formatted.cursorPosition);
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(event: ChangeEvent): void {
    const { value } = event.target as HTMLTextAreaElement;

    onChange(value);

    if (value.length > code.length) {
      const diff = value
        .replace(code.slice(0, cursorPosition), '')
        .replace(code.slice(cursorPosition), '');
      const autoCloseChar = getAutoCloseChar(diff);

      if (autoCloseChar !== undefined) {
        docExec.insertText(autoCloseChar);
        setCursorPosition(cursorPosition + 1);
      } else if (
        isIntoAutoCloseGroup(code, cursorPosition) &&
        isAutoCloseChar(diff)
      ) {
        docExec.forwardDelete();
      }
    }
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
        onSelect={({ target }) => {
          setCursorPosition((target as HTMLTextAreaElement).selectionStart);
        }}
        ref={textAreaElementRef}
        spellCheck={false}
        value={code}
      />
      <Toolbar className={styles.toolbar}>
        <ToolButton icon={faStream} onClick={format} title="Format (Ctrl+S)" />
      </Toolbar>
    </div>
  );
};

interface Props {
  className?: string;
  code: string;
  onChange(code: string): void;
}
