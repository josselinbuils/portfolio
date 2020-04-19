import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.min';
import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import { LineNumbers } from './components';

import 'prismjs-darcula-theme/darcula.scss';
import styles from './Editor.module.scss';

export const Editor: FC<Props> = ({ code, onChange }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [lineCount, setLineCount] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const codeElementRef = useRef<HTMLDivElement>(null);

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
    if (codeElementRef.current !== null) {
      codeElementRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  return (
    <div className={styles.editor} tabIndex={0}>
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
        onChange={(event) => onChange(event.target.value)}
        onScroll={({ target }) =>
          setScrollTop((target as HTMLTextAreaElement).scrollTop)
        }
        spellCheck={false}
        value={code}
      />
    </div>
  );
};

interface Props {
  code: string;
  onChange(code: string): void;
}
