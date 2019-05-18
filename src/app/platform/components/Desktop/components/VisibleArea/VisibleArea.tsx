import React, { FC, useRef } from 'react';
import { useDragAndDrop, useInjector } from '~/platform/hooks';
import { WindowManager } from '~/platform/services/WindowManager';
import { Windows } from './Windows';
import styles from './VisibleArea.module.scss';

export const VisibleArea: FC = () => {
  const selectionRef = useRef<HTMLDivElement>(null);
  const visibleAreaRef = useRef<HTMLDivElement>(null);
  const windowManager = useInjector(WindowManager);

  const mouseDownHandler = useDragAndDrop(
    (downEvent: MouseEvent) => {
      if (downEvent.target !== visibleAreaRef.current) {
        return;
      }

      const visibleAreaElement = visibleAreaRef.current as HTMLDivElement;
      const offsetX = -visibleAreaElement.getBoundingClientRect().left;
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
      const selectionStyle = (selectionRef.current as HTMLDivElement).style;
      selectionStyle.display = 'none';
      selectionStyle.width = '0';
      selectionStyle.height = '0';
    }
  );

  return (
    <div
      className={styles.visibleArea}
      onMouseDown={mouseDownHandler}
      ref={visibleAreaRef}
    >
      <Windows visibleAreaRef={visibleAreaRef} />
      <div className={styles.selection} ref={selectionRef} />
    </div>
  );
};
