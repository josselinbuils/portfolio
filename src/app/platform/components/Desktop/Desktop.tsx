import React, { CSSProperties, useRef, useState } from 'react';
import { useDragAndDrop } from '~/platform/hooks';
import { useWindowManager } from '~/platform/providers/WindowProvider';
import styles from './Desktop.module.scss';

export const Desktop = () => {
  const [selectionStyle, setSelectionStyle] = useState<CSSProperties>();
  const desktopRef = useRef(null);
  const windowManager = useWindowManager();

  const mouseDownHandler = useDragAndDrop(
    (downEvent: MouseEvent) => {
      if (downEvent.target !== desktopRef.current) {
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
    <div
      className={styles.desktop}
      onMouseDown={mouseDownHandler}
      ref={desktopRef}
    >
      {selectionStyle && (
        <div className={styles.selection} style={selectionStyle} />
      )}
    </div>
  );
};
