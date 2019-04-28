import classNames from 'classnames';
import React, { FC, MouseEvent } from 'react';
import { Size } from '~/platform/interfaces';
import './Window.scss';

export const Window: FC<Props> = ({
  active,
  animationDurationMs,
  centered,
  background,
  children,
  frozen,
  maximized,
  minimized,
  onClose,
  onMaximize,
  onMinimise,
  onMoveStart,
  onResizeStart,
  onSelect,
  position: { x, y },
  resizable = true,
  size: { height, width },
  titleBackground,
  titleColor,
  zIndex,
  windowTitle
}) => {
  const animated = animationDurationMs !== undefined;
  const className = classNames('window', {
    active,
    animated,
    centered,
    maximized,
    minimized
  });
  const style = {
    background,
    height,
    left: x,
    top: y,
    transitionDuration: animated ? `${animationDurationMs}ms` : undefined,
    width,
    zIndex
  };
  const titleStyle = { background: titleBackground, color: titleColor };

  return (
    <div className={className} onMouseDown={onSelect} style={style}>
      <div
        className="titlebar"
        style={titleStyle}
        onMouseDown={onMoveStart}
        onDoubleClick={() => onMaximize()}
      >
        <div className={classNames('buttons', { frozen })}>
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
      <div className={classNames('content', { frozen })}>{children}</div>
      {resizable && <div className="resize" onMouseDown={onResizeStart} />}
    </div>
  );
};

interface Props {
  active: boolean;
  animationDurationMs?: number;
  centered: boolean;
  background: string;
  frozen: boolean;
  maximized: boolean;
  minimized: boolean;
  position: { x: number; y: number };
  resizable: boolean;
  titleBackground: string;
  titleColor: string;
  size: Size;
  windowTitle: string;
  zIndex: number;
  onClose(): void;
  onMaximize(): void;
  onMinimise(): void;
  onMoveStart(downEvent: MouseEvent): void;
  onResizeStart(): void;
  onSelect(): void;
}
