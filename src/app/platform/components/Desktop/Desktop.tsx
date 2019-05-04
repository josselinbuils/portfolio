import React, { CSSProperties, FC, useRef, useState } from 'react';
import { useDragAndDrop, useInjector } from '~/platform/hooks';
import { WindowManager } from '~/platform/services';
import { Windows } from './Windows';
import styles from './Desktop.module.scss';

export const Desktop: FC = () => {
  const [selectionStyle, setSelectionStyle] = useState<CSSProperties>();
  const desktopRef = useRef<HTMLDivElement>(null);
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
      <Windows desktopRef={desktopRef} />
      {selectionStyle && (
        <div className={styles.selection} style={selectionStyle} />
      )}
    </div>
  );
};
