import React, { useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { useEventListener } from '~/platform/hooks';
import { CodeEditorDescriptor } from './CodeEditorDescriptor';
import { Console, Editor } from './components';

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
      if (
        !event.altKey &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'e'
      ) {
        event.preventDefault();
        setCodeToExec(code);
      }
    },
    active
  );

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
        <Console codeToExec={codeToExec} />
      </div>
    </Window>
  );
};

CodeEditor.appDescriptor = CodeEditorDescriptor;

export default CodeEditor;
