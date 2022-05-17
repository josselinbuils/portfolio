import React, { useRef, useState } from 'react';
import { Window } from '~/platform/components/Window/Window';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';
import { useDragAndDrop } from '~/platform/hooks/useDragAndDrop';
import { Console } from './components/Console/Console';
import { Editor } from './components/Editor/Editor';
import { StatusBar } from './components/StatusBar/StatusBar';

import styles from './CodeEditor.module.scss';

const CodeEditor: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => {
  const [code, setCode] = useState('');
  const [cursorPosition, setCursorPosition] = useState({
    offset: 0,
    x: 0,
    y: 0,
  });
  const [consoleHeight, setConsoleHeight] = useState('40%');
  const consoleElementRef = useRef<HTMLDivElement>(null);
  const resizeStartHandler = useDragAndDrop(onResizeStart);

  function onResizeStart(
    downEvent: React.PointerEvent
  ): ((moveEvent: PointerEvent) => void) | void {
    if (consoleElementRef.current === null) {
      return;
    }

    const consoleStartHeight = consoleElementRef.current.clientHeight;
    const startY = downEvent.clientY;

    return (moveEvent: PointerEvent) =>
      setConsoleHeight(`${consoleStartHeight - moveEvent.clientY + startY}px`);
  }

  return (
    <Window
      active={active}
      background="#45484a"
      minHeight={600}
      minWidth={800}
      ref={windowRef}
      title="CodeEditor"
      titleBackground="#f0f0f0"
      titleColor="#2f2f2f"
      {...injectedWindowProps}
    >
      <div className={styles.codeEditor}>
        <Editor
          className={styles.editor}
          code={code}
          onChange={setCode}
          onCursorPositionUpdate={setCursorPosition}
        />
        <div className={styles.resizeBar} onPointerDown={resizeStartHandler} />
        <Console
          active={active}
          className={styles.console}
          codeToExec={code}
          height={consoleHeight}
          ref={consoleElementRef}
        />
        <StatusBar
          className={styles.statusBar}
          cursorPosition={cursorPosition}
        />
      </div>
    </Window>
  );
};

export default CodeEditor;
