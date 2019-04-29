import React, { CSSProperties, useRef, useState } from 'react';
import { TaskBar } from '~/platform/components/TaskBar';
import { ContextMenuProvider } from '~/platform/providers/ContextMenuProvider';
import { useWindowManager, Windows } from '~/platform/providers/WindowProvider';
import styles from './App.module.scss';
import { useDragAndDrop } from '~/platform/hooks';

export const App = () => {
  const [selectionStyle, setSelectionStyle] = useState<CSSProperties>();
  const appRef = useRef(null);
  const windowManager = useWindowManager();
  const dragAndDropHandler = useDragAndDrop();

  const mouseDownHandler = dragAndDropHandler(
    (downEvent: MouseEvent) => {
      if (downEvent.target !== appRef.current) {
        return;
      }

      windowManager.unselectAllWindows();

      const startX = downEvent.clientX;
      const startY = downEvent.clientY;

      return (moveEvent: MouseEvent) => {
        setSelectionStyle({
          display: 'block',
          left: Math.min(startX, moveEvent.clientX),
          top: Math.min(startY, moveEvent.clientY),
          width: Math.abs(moveEvent.clientX - startX),
          height: Math.abs(moveEvent.clientY - startY)
        });
      };
    },
    () => setSelectionStyle(undefined)
  );

  return (
    <ContextMenuProvider>
      <main className={styles.app} onMouseDown={mouseDownHandler} ref={appRef}>
        <TaskBar />
        <Windows />
        <div className={styles.selection} style={selectionStyle} />
      </main>
    </ContextMenuProvider>
  );
};
