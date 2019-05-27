import cn from 'classnames';
import React, { CSSProperties, forwardRef, useEffect } from 'react';
import { useDragAndDrop } from '~/platform/hooks';
import { Size } from '~/platform/interfaces';
import {
  ANIMATION_DURATION,
  ANIMATION_DURATION_FAST,
  VERTICAL_OFFSET_TO_UNMAXIMIZE
} from '../constants';
import { useAnimation } from '../hooks';
import { MovableProps } from '../providers/Movable';
import { ResizableProps } from '../providers/Resizable';
import { getRelativeOffset } from '../utils';
import { TitleBar } from './TitleBar';
import styles from './WindowStatic.module.scss';

// TODO try useReducer to reduce the number of props there

export const WindowStatic = forwardRef<HTMLDivElement, Props>(
  (
    {
      active,
      background,
      children,
      clearUnmaximizePosition,
      getUnmaximizeSize,
      id,
      onClose,
      onMinimise,
      onMoveStartRef,
      onResizeStart,
      onSelect,
      maximized,
      minimized,
      moving,
      position,
      resetPosition,
      resetSize,
      resizable = true,
      resizing,
      setMaximizedPosition,
      setMaximizedSize,
      setMinimizedPosition,
      setMinimizedSize,
      setPosition,
      size,
      title,
      titleBackground,
      titleColor,
      visible,
      zIndex
    },
    ref
  ) => {
    const [animationDurationMs, animate] = useAnimation();

    const maximizedMoveStartHandler = useDragAndDrop(
      (downEvent: React.MouseEvent) => {
        const unmaximizeSize = getUnmaximizeSize() as Size;
        const dx = getRelativeOffset(
          downEvent.nativeEvent,
          size.width,
          unmaximizeSize.width
        );
        let moveStarted = false;

        return (moveEvent: MouseEvent) => {
          if (
            !moveStarted &&
            moveEvent.clientY >
              downEvent.clientY + VERTICAL_OFFSET_TO_UNMAXIMIZE
          ) {
            const duration = ANIMATION_DURATION_FAST;

            animate(duration);
            setTimeout(() => onMoveStartRef.current(downEvent), duration);
            clearUnmaximizePosition();
            setPosition({
              x: position.x - downEvent.clientX + moveEvent.clientX + dx,
              y: position.y - downEvent.clientY + moveEvent.clientY
            });
            resetSize();

            downEvent.clientX = moveEvent.clientX;
            downEvent.clientY = moveEvent.clientY;
            moveStarted = true;
          }
        };
      }
    );

    function toggleMaximize(): void {
      if (maximized) {
        animate(ANIMATION_DURATION);
        resetPosition();
        resetSize();
      } else if (resizable) {
        animate(ANIMATION_DURATION);
        setMaximizedSize();
        setMaximizedPosition();
      }
    }

    useEffect(() => {
      if (!visible) {
        if (!minimized) {
          animate(ANIMATION_DURATION);
          setMinimizedPosition();
          setMinimizedSize();
        }
      } else if (minimized) {
        animate(ANIMATION_DURATION);
        resetPosition();
        resetSize();
      }
    });

    const animated = animationDurationMs !== undefined;
    const frozen = moving || resizing;
    const showResizeElement = resizable && !maximized;
    const moveStartHandler = maximized
      ? maximizedMoveStartHandler
      : onMoveStartRef.current;

    const className = cn(styles.window, {
      [styles.active]: active,
      [styles.animated]: animated,
      [styles.maximized]: maximized,
      [styles.minimized]: minimized
    });
    const style: CSSProperties = {
      background,
      height: size.height,
      left: position.x,
      top: position.y,
      width: size.width,
      zIndex
    };

    if (animated) {
      style.transitionDuration = `${animationDurationMs}ms`;
    }

    return (
      <div
        className={className}
        onMouseDown={() => onSelect(id)}
        ref={ref}
        style={style}
      >
        <TitleBar
          background={titleBackground}
          color={titleColor}
          frozen={frozen}
          showMaximizeButton={resizable}
          title={title}
          maximized={maximized}
          onClose={() => onClose(id)}
          onMinimise={() => onMinimise(id)}
          onMoveStart={moveStartHandler}
          onToggleMaximize={toggleMaximize}
        />
        <main className={cn(styles.content, { [styles.frozen]: frozen })}>
          {children}
        </main>
        {showResizeElement && (
          <div className={styles.resize} onMouseDown={onResizeStart} />
        )}
      </div>
    );
  }
);

export interface WindowStaticProps {
  active: boolean;
  background: string;
  id: number;
  resizable?: boolean;
  title: string;
  titleBackground?: string;
  titleColor: string;
  visible: boolean;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onSelect(id: number): void;
}

type Props = ResizableProps & MovableProps & WindowStaticProps;
