import { faStream } from '@fortawesome/free-solid-svg-icons/faStream';
import cn from 'classnames';
import parserBabel from 'prettier/parser-babel';
import prettier from 'prettier/standalone';
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

import 'prismjs-darcula-theme/darcula.scss';
import styles from './Editor.module.scss';

const AUTO_COMPLETION_KEYS = [
  'const ',
  'false',
  'function ',
  'let ',
  'return ',
  'true',
];
const BRACKET_MAP = {
  '{': '}',
  '(': ')',
  '[': ']',
} as { [char: string]: string };
const INDENT_SPACES = '  ';

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
        if (
          code.charAt(cursorPosition) ===
          BRACKET_MAP[code.charAt(cursorPosition - 1)]
        ) {
          document.execCommand('forwardDelete', false);
        }
        return false;
      },
      'Control+S,Meta+S': format,
      Enter: () => {
        const line = code.slice(0, cursorPosition).match(/\n/g)?.length || 0;
        const indent = code.split('\n')[line].match(/^ */)?.[0].length || 0;
        const isBetweenBrackets =
          code[cursorPosition] &&
          code[cursorPosition] === BRACKET_MAP[code[cursorPosition - 1]];
        const shouldIncreaseIndent = !!BRACKET_MAP[code[cursorPosition - 1]];
        const indentSpaces = ' '.repeat(indent);
        const additionalSpaces = shouldIncreaseIndent ? INDENT_SPACES : '';

        if (isBetweenBrackets) {
          insertText(`\n${indentSpaces}${additionalSpaces}\n${indentSpaces}`);
          setCursorPosition(cursorPosition + indent + 3);
        } else {
          insertText(`\n${indentSpaces}${additionalSpaces}`);
        }
      },
      Tab: () => {
        const partial = code.slice(0, cursorPosition).split(' ').slice(-1)[0];
        const keyword =
          partial.length > 1
            ? AUTO_COMPLETION_KEYS.find((key) => key.startsWith(partial))
            : undefined;

        insertText(
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
      const { formatted, cursorOffset } = prettier.formatWithCursor(code, {
        cursorOffset: cursorPosition,
        parser: 'babel',
        plugins: [parserBabel],
        singleQuote: true,
      });

      onChange(formatted);
      setCursorPosition(cursorOffset);
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

      if (BRACKET_MAP[diff] !== undefined) {
        insertText(BRACKET_MAP[diff]);
        setCursorPosition(cursorPosition + 1);
      }
    }
  }

  function insertText(str: string): void {
    document.execCommand('insertText', false, str);
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
        {/*<ToolButton icon={faPlay} onClick={onClickPlay} title="Execute" />*/}
        <ToolButton icon={faStream} onClick={format} title="Format" />
      </Toolbar>
    </div>
  );
};

interface Props {
  className?: string;
  code: string;
  onChange(code: string): void;
}
