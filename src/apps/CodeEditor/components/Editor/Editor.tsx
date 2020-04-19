import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.min';
import React, { FC, UIEvent, useLayoutEffect, useRef, useState } from 'react';

import 'prismjs-darcula-theme/darcula.scss';
import styles from './Editor.module.scss';

export const Editor: FC<Props> = ({ code, onChange }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [lineNumbers, setLineNumbers] = useState('1');
  const lineNumbersElementRef = useRef<HTMLDivElement>(null);
  const codeElementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const lineCount = (code.match(/\n/g)?.length || 0) + 1;
    let numbers = '1';

    for (let i = 2; i <= lineCount; i++) {
      numbers = `${numbers}\n${i}`;
    }
    setLineNumbers(numbers);

    const highlighted = Prism.highlight(
      code,
      Prism.languages.javascript,
      'javascript'
    );

    setHighlightedCode(
      highlighted.slice(-1) === '\n' ? `${highlighted} ` : highlighted
    );
  }, [code]);

  function scrollHandler(event: UIEvent): void {
    if (
      codeElementRef.current !== null &&
      lineNumbersElementRef.current !== null
    ) {
      const { scrollTop } = event.target as HTMLTextAreaElement;
      codeElementRef.current.scrollTop = scrollTop;
      lineNumbersElementRef.current.scrollTop = scrollTop;
    }
  }

  return (
    <div className={styles.editor} tabIndex={0}>
      <div className={styles.lineNumbers} ref={lineNumbersElementRef}>
        {lineNumbers}
      </div>
      <div
        className={styles.code}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        ref={codeElementRef}
      />
      <textarea
        className={styles.textarea}
        onChange={(event) => onChange(event.target.value)}
        onScroll={scrollHandler}
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
