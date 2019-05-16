import cn from 'classnames';
import React, { FC, RefObject, useEffect, useRef, useState } from 'react';
import { useDragAndDrop, useEventListener } from '~/platform/hooks';
import { Position, Size } from '~/platform/interfaces';
import { noop } from '~/platform/utils';
import { ANIMATION_DURATION, VERTICAL_OFFSET_TO_UNMAXIMIZE } from './constants';
import { useAnimation, useSize } from './hooks';
import { TitleBar } from './TitleBar';
import { boundPosition, getRelativeOffset, getSize } from './utils';
import styles from './Window.module.scss';

export const Window: FC<Props> = ({
  active,
  background,
  desktopRef,
  children,
  keepContentRatio = false,
  id,
  maxHeight = Infinity,
  maxWidth = Infinity,
  minHeight,
  minimizedTopPosition,
  minWidth,
  onClose,
  onMinimise,
  onResize = noop,
  onSelect,
  resizable = true,
  title,
  titleBackground,
  titleColor,
  visible,
  zIndex
}) => {
  const [frozen, setFrozen] = useState(false);
  const [unmaximizeProps, setUnmaximizeProps] = useState<Position & Size>();
  const [unminimizeProps, setUnminimizeProps] = useState<Position & Size>();
  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLMainElement>(null);
  const [animationDurationMs, animate] = useAnimation();
  const [size, setSize, setMaxSize] = useSize(
    { maxHeight, maxWidth, minHeight, minWidth },
    keepContentRatio,
    desktopRef,
    windowRef,
    contentRef,
    onResize
  );
  const desktopSize = getSize(desktopRef);
  const [position, setPosition] = useState<Position>(() => ({
    x: Math.round((desktopSize.width - size.width) * 0.5),
    y: Math.round((desktopSize.height - size.height) * 0.2)
  }));
  const maximized = unmaximizeProps !== undefined;
  const minimized = size.width === 0 && size.height === 0;

  function toggleMaximize(
    keepPosition: boolean = false,
    animationDuration: number = ANIMATION_DURATION
  ) {
    if (!resizable) {
      return size;
    }

    animate(animationDuration);

    if (unmaximizeProps !== undefined) {
      const { height, width, x, y } = unmaximizeProps;

      if (!keepPosition) {
        const position = boundPosition(x, y, desktopSize, width);
        setPosition(position);
      }
      setUnmaximizeProps(undefined);
      return setSize(width, height);
    } else {
      setUnmaximizeProps({ ...position, ...size });

      if (!keepPosition) {
        const position = boundPosition(0, 0, desktopSize, size.width);
        setPosition(position);
      }
      return setMaxSize();
    }
  }

  const moveStartHandler = useDragAndDrop(
    (downEvent: MouseEvent) => {
      const windowStyle = (windowRef.current as HTMLDivElement).style;
      const dy = position.y - downEvent.clientY;

      let dx = position.x - downEvent.clientX;
      let shouldToggleMaximize = false;
      let width = size.width;

      setFrozen(true);

      if (unmaximizeProps !== undefined) {
        const nextWidth = unmaximizeProps.width;
        dx += getRelativeOffset(downEvent, width, nextWidth);
        shouldToggleMaximize = true;
      }

      return (moveEvent: MouseEvent) => {
        if (
          shouldToggleMaximize &&
          moveEvent.clientY < downEvent.clientY + VERTICAL_OFFSET_TO_UNMAXIMIZE
        ) {
          return;
        }
        if (shouldToggleMaximize) {
          width = toggleMaximize(true, 50).width;
          shouldToggleMaximize = false;
        }

        const { x, y } = boundPosition(
          moveEvent.clientX + dx,
          moveEvent.clientY + dy,
          desktopSize,
          width
        );

        windowStyle.left = `${x}px`;
        windowStyle.top = `${y}px`;
      };
    },
    () => {
      const { left, top } = (windowRef.current as HTMLDivElement).style;

      setFrozen(false);
      setPosition({
        x: parseInt(left as string, 10),
        y: parseInt(top as string, 10)
      });
    }
  );

  const resizeStartHandler = useDragAndDrop(
    (downEvent: MouseEvent) => {
      if (maximized) {
        return;
      }
      setFrozen(true);

      return (moveEvent: MouseEvent) => {
        const width = size.width + moveEvent.clientX - downEvent.clientX;
        const height = size.height + moveEvent.clientY - downEvent.clientY;
        setSize(width, height);
      };
    },
    () => setFrozen(false)
  );

  useEffect(() => {
    if (!visible) {
      if (unminimizeProps === undefined) {
        animate(ANIMATION_DURATION);
        setUnminimizeProps({ ...position, ...size });
        setSize(0, 0, true);
        setPosition(position);
        setPosition({ x: 0, y: minimizedTopPosition || 0 });
      }
    } else if (unminimizeProps !== undefined) {
      const { height, width, x, y } = unminimizeProps;
      animate(ANIMATION_DURATION);
      setUnminimizeProps(undefined);
      setSize(width, height);
      setPosition({ x, y });
    }
  }, [
    animate,
    minimizedTopPosition,
    position,
    setPosition,
    setSize,
    size,
    unminimizeProps,
    visible
  ]);

  useEventListener('resize', () => {
    if (maximized) {
      setMaxSize();
    }
  });

  const animated = animationDurationMs !== undefined;
  const className = cn(styles.window, {
    [styles.active]: active,
    [styles.animated]: animated,
    [styles.maximized]: maximized,
    [styles.minimized]: minimized
  });
  const { x, y } = position;
  const { height, width } = size;
  const style = {
    background,
    height,
    left: x,
    top: y,
    transitionDuration: animated ? `${animationDurationMs}ms` : undefined,
    width,
    zIndex
  };

  return (
    <div
      className={className}
      onMouseDown={() => onSelect(id)}
      ref={windowRef}
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
        onMaximize={toggleMaximize}
        onMinimise={() => onMinimise(id)}
        onMoveStart={moveStartHandler}
      />
      <main
        className={cn(styles.content, { [styles.frozen]: frozen })}
        ref={contentRef}
      >
        {children}
      </main>
      {resizable && (
        <div className={styles.resize} onMouseDown={resizeStartHandler} />
      )}
    </div>
  );
};

interface Props {
  active: boolean;
  background: string;
  desktopRef: RefObject<HTMLElement>;
  keepContentRatio?: boolean;
  id: number;
  maxHeight?: number;
  maxWidth?: number;
  minHeight: number;
  minimizedTopPosition?: number;
  minWidth: number;
  resizable?: boolean;
  title: string;
  titleBackground?: string;
  titleColor: string;
  visible: boolean;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onResize?(size: Size): void;
  onSelect(id: number): void;
}
