import classNames from 'classnames';
import React, { forwardRef, RefObject } from 'react';

import './Window.scss';

export const Window = forwardRef<HTMLDivElement, Props>(
  (
    {
      active,
      animate,
      background,
      children,
      contentRef,
      maximized,
      minimized,
      onClose,
      onMaximize,
      onMinimise,
      onResizeStart,
      onSelect,
      onTitleDoubleClick,
      onTitleMouseDown,
      position,
      resizable = true,
      size = {},
      titleBackground,
      titleColor,
      zIndex,
      windowTitle
    },
    ref
  ) => {
    const className = classNames('window', {
      active,
      animate,
      maximized,
      minimized
    });
    const { x, y } = position;
    const { height, width } = size;

    return (
      <div
        className={className}
        onMouseDown={onSelect}
        ref={ref}
        style={{ background, height, left: x, top: y, width, zIndex }}
      >
        <div
          className="titlebar"
          style={{ background: titleBackground, color: titleColor }}
          onMouseDown={onTitleMouseDown}
          onDoubleClick={onTitleDoubleClick}
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
  animate: boolean;
  background: string;
  contentRef: RefObject<HTMLDivElement>;
  maximized: boolean;
  minimized: boolean;
  position: { x: number; y: number };
  resizable?: boolean;
  titleBackground: string;
  titleColor: string;
  size?: { height?: number; width?: number };
  windowTitle: string;
  zIndex: number;
  onClose(): void;
  onMaximize(): void;
  onMinimise(): void;
  onResizeStart(): void;
  onSelect(): void;
  onTitleDoubleClick(): void;
  onTitleMouseDown(): void;
}
