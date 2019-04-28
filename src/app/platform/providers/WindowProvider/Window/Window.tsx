import classNames from 'classnames';
import React, { CSSProperties, forwardRef, MouseEvent, RefObject } from 'react';

import './Window.scss';

export const Window = forwardRef<HTMLDivElement, Props>(
  (
    {
      active,
      animationDurationMs,
      centered,
      background,
      children,
      contentRef,
      maximized,
      minimized,
      onClose,
      onMaximize,
      onMinimise,
      onMoveStart,
      onResizeStart,
      onSelect,
      position,
      resizable = true,
      size = { height: undefined, width: undefined },
      titleBackground,
      titleColor,
      zIndex,
      windowTitle
    },
    ref
  ) => {
    const className = classNames('window', {
      active,
      animated: animationDurationMs !== undefined,
      centered,
      maximized,
      minimized
    });
    const { x, y } = position;
    const { height, width } = size;
    const style: CSSProperties = {
      background,
      height,
      left: x,
      top: y,
      width,
      zIndex
    };

    if (animationDurationMs !== undefined) {
      style.transitionDuration = `${animationDurationMs}ms`;
    }

    return (
      <div className={className} onMouseDown={onSelect} ref={ref} style={style}>
        <div
          className="titlebar"
          style={{ background: titleBackground, color: titleColor }}
          onMouseDown={onMoveStart}
          onDoubleClick={() => onMaximize()}
        >
          <div className="buttons">
            <div className="button close" onClick={() => onClose()}>
              <i className="fas fa-times" />
            </div>
            <div className="button minimize" onClick={() => onMinimise()}>
              <i className="fas fa-minus" />
            </div>
            {resizable && (
              <div className="button maximize" onClick={() => onMaximize()}>
                <i className="fas fa-plus" />
              </div>
            )}
          </div>
          <span className="title">{windowTitle}</span>
        </div>
        <div className="content" ref={contentRef}>
          {children}
        </div>
        {resizable && <div className="resize" onMouseDown={onResizeStart} />}
      </div>
    );
  }
);

interface Props {
  active: boolean;
  animationDurationMs?: number;
  centered: boolean;
  background: string;
  contentRef: RefObject<HTMLDivElement>;
  maximized: boolean;
  minimized: boolean;
  position: { x: number; y: number };
  resizable: boolean;
  titleBackground: string;
  titleColor: string;
  size?: { height?: number; width?: number };
  windowTitle: string;
  zIndex: number;
  onClose(): void;
  onMaximize(): void;
  onMinimise(): void;
  onMoveStart(downEvent: MouseEvent): void;
  onResizeStart(): void;
  onSelect(): void;
}
