import { useRef, useState } from 'preact/compat';
import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { useDragAndDrop } from '@/platform/hooks/useDragAndDrop';
import { WithMenu } from '@/platform/providers/WithMenu/WithMenu';
import styles from './CodeEditor.module.scss';
import { Console } from './components/Console/Console';
import { Editor } from './components/Editor/Editor';
import { StatusBar } from './components/StatusBar/StatusBar';

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
  const [consoleHeight, setConsoleHeight] = useState('35%');
  const consoleElementRef = useRef<HTMLDivElement>(null);
  const resizeStartHandler = useDragAndDrop(onResizeStart);

  function onResizeStart(
    downEvent: PointerEvent,
  ): ((moveEvent: PointerEvent) => void) | void {
    if (consoleElementRef.current === null) {
      return;
    }

    const consoleStartHeightPx = consoleElementRef.current.clientHeight;
    const consoleStartHeightPercent = parseInt(consoleHeight, 10);
    const startY = downEvent.clientY;

    return (moveEvent: PointerEvent) => {
      const deltaHeight = (startY - moveEvent.clientY) / consoleStartHeightPx;
      const newHeightPercent = consoleStartHeightPercent * (1 + deltaHeight);
      const newHeightBounded = Math.min(Math.max(newHeightPercent, 0), 100);

      return setConsoleHeight(`${Math.round(newHeightBounded * 100) / 100}%`);
    };
  }

  return (
    <Window
      active={active}
      className={styles.codeEditorWindow}
      minHeight={675}
      minWidth={900}
      ref={windowRef}
      title="CodeEditor"
      titleBackground="#434548"
      titleColor="#c3c3c3"
      {...injectedWindowProps}
    >
      <div className={styles.codeEditor}>
        <WithMenu>
          <Editor
            className={styles.editor}
            code={code}
            onChange={setCode}
            onCursorPositionUpdate={setCursorPosition}
          />
        </WithMenu>
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
