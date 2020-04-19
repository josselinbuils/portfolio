import parserBabel from 'prettier/parser-babel';
import prettier from 'prettier/standalone';
import React, { useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { useEventListener } from '~/platform/hooks';
import { CodeEditorDescriptor } from './CodeEditorDescriptor';
import { Console, Editor, Toolbar } from './components';

import styles from './CodeEditor.module.scss';

const CodeEditor: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => {
  const [code, setCode] = useState('');
  const [codeToExec, setCodeToExec] = useState<string>();

  useEventListener(
    'keydown',
    (event) => {
      if (!event.altKey && (event.metaKey || event.ctrlKey)) {
        if (event.key.toLowerCase() === 'e') {
          event.preventDefault();
          setCodeToExec(code);
        } else if (event.key.toLowerCase() === 's') {
          event.preventDefault();
          format();
        }
      }
    },
    active
  );

  function format(): void {
    try {
      setCode(
        prettier.format(code, {
          parser: 'babel',
          plugins: [parserBabel],
          singleQuote: true,
        })
      );
    } catch (error) {}
  }

  return (
    <Window
      active={active}
      {...injectedWindowProps}
      background="#45484a"
      minHeight={450}
      minWidth={900}
      ref={windowRef}
      title={CodeEditorDescriptor.appName}
      titleBackground="#f0f0f0"
      titleColor="#2f2f2f"
    >
      <div className={styles.codeEditor}>
        <Editor code={code} onChange={setCode} />
        <Toolbar
          onClickFormat={format}
          onClickPlay={() => setCodeToExec(code)}
        />
        <Console codeToExec={codeToExec} />
      </div>
    </Window>
  );
};

CodeEditor.appDescriptor = CodeEditorDescriptor;

export default CodeEditor;
