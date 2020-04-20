import { faStream } from '@fortawesome/free-solid-svg-icons/faStream';
import parserBabel from 'prettier/parser-babel';
import prettier from 'prettier/standalone';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.min';
import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import { Toolbar, ToolButton } from '~/apps/CodeEditor/components';
import { useKeyMap } from '~/platform/hooks';
import { LineNumbers, StatusBar } from './components';

import 'prismjs-darcula-theme/darcula.scss';
import styles from './Editor.module.scss';

export const Editor: FC<Props> = ({ code, onChange }) => {
  const [active, setActive] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [lineCount, setLineCount] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const codeElementRef = useRef<HTMLDivElement>(null);
  const textAreaElementRef = useRef<HTMLTextAreaElement>(null);

  useKeyMap(
    {
      'Control+S,Meta+S': format,
      Enter: () => {
        const line = code.slice(0, cursorPosition).match(/\n/g)?.length || 0;
        const indent = code.split('\n')[line].match(/^ */)?.[0].length || 0;
        const spaces = ' '.repeat(indent);
        const insertBracket =
          code[cursorPosition - 1] === '{' &&
          !new RegExp(`^\\s*\\n {${indent}}}`).test(code.slice(cursorPosition));

        if (insertBracket) {
          document.execCommand(
            'insertText',
            false,
            `\n${spaces}  \n${spaces}}`
          );
          setCursorPosition(cursorPosition + indent + 3);
        } else {
          document.execCommand('insertText', false, `\n${spaces}`);
        }
      },
      Tab: () => {
        document.execCommand('insertText', false, '  ');
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
      onChange(
        prettier.format(code, {
          parser: 'babel',
          plugins: [parserBabel],
          singleQuote: true,
        })
      );
    } catch (error) {}
  }

  return (
    <div className={styles.editor}>
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
        onChange={(event) => onChange(event.target.value)}
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
      <StatusBar className={styles.statusBar} />
    </div>
  );
};

interface Props {
  code: string;
  onChange(code: string): void;
}
