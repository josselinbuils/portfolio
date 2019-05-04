import React, { CSSProperties, useRef, useState } from 'react';
import { useDragAndDrop, useInjector } from '~/platform/hooks';
import { WindowManager } from '~/platform/services';
import styles from './Desktop.module.scss';

export const Desktop = () => {
  const [selectionStyle, setSelectionStyle] = useState<CSSProperties>();
  const desktopRef = useRef(null);
  const windowManager = useInjector(WindowManager);

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
