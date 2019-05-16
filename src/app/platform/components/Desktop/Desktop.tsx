import React, { FC, useRef } from 'react';
import { useDragAndDrop, useInjector } from '~/platform/hooks';
import { WindowManager } from '~/platform/services';
import { Windows } from './Windows';
import styles from './Desktop.module.scss';

export const Desktop: FC = () => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const windowManager = useInjector(WindowManager);

  const mouseDownHandler = useDragAndDrop(
    (downEvent: MouseEvent) => {
      if (downEvent.target !== desktopRef.current) {
        return;
      }

      const desktopElement = desktopRef.current as HTMLDivElement;
      const offsetX = -desktopElement.getBoundingClientRect().left;
      const startX = downEvent.clientX + offsetX;
      const startY = downEvent.clientY;
      const selectionStyle = (selectionRef.current as HTMLDivElement).style;

      windowManager.unselectAllWindows();
      selectionStyle.display = 'block';

      return (moveEvent: MouseEvent) => {
        const x = moveEvent.clientX + offsetX;
        const y = moveEvent.clientY;

        selectionStyle.left = `${Math.min(startX, x)}px`;
        selectionStyle.top = `${Math.min(startY, y)}px`;
        selectionStyle.width = `${Math.abs(x - startX)}px`;
        selectionStyle.height = `${Math.abs(y - startY)}px`;
      };
    },
    () => {
      (selectionRef.current as HTMLDivElement).style.display = 'none';
    }
  );

  return (
    <div
      className={styles.desktop}
      onMouseDown={mouseDownHandler}
      ref={desktopRef}
    >
      <Windows desktopRef={desktopRef} />
      <div className={styles.selection} ref={selectionRef} />
    </div>
  );
};
