import cn from 'classnames';
import React, { FC, RefObject, useRef, useState } from 'react';
import {
  useChangeDetector,
  useDragAndDrop,
  useEventListener
} from '~/platform/hooks';
import { Position, Size } from '~/platform/interfaces';
import { noop } from '~/platform/utils';
import { ANIMATION_DURATION, VERTICAL_OFFSET_TO_UNMAXIMIZE } from './constants';
import { useAnimation, usePosition, useSize } from './hooks';
import { TitleBar } from './TitleBar';
import { getRelativeOffset } from './utils';
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
  const [minimized, setMinimized] = useState(false);
  const [unmaximizeProps, setUnmaximizeProps] = useState<Position & Size>();
  const [unminimizeProps, setUnminimizeProps] = useState<Position & Size>();
  const contentRef = useRef<HTMLMainElement>(null);
  const [animationDurationMs, animate] = useAnimation();
  const [size, setSize, setMaxSize] = useSize(
    { maxHeight, maxWidth, minHeight, minWidth },
    keepContentRatio,
    desktopRef,
    contentRef,
    onResize
  );
  const [position, setPosition] = usePosition(size, desktopRef);
  const maximized = unmaximizeProps !== undefined;

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
        setPosition(x, y, width);
      }
      setUnmaximizeProps(undefined);
      return setSize(width, height);
    } else {
      setUnmaximizeProps({ ...position, ...size });

      if (!keepPosition) {
        setPosition(0, 0, size.width);
      }
      return setMaxSize();
    }
  }

  const moveStartHandler = useDragAndDrop(
    (downEvent: MouseEvent) => {
      const dy = position.y - downEvent.clientY;
      let dx = position.x - downEvent.clientX;

      setFrozen(true);

      let shouldToggleMaximize = false;

      if (unmaximizeProps !== undefined) {
        const nextWidth = unmaximizeProps.width;
        dx += getRelativeOffset(downEvent, size.width, nextWidth);
        shouldToggleMaximize = true;
      }

      let width = size.width;

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
        setPosition(moveEvent.clientX + dx, moveEvent.clientY + dy, width);
      };
    },
    () => setFrozen(false)
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

  useChangeDetector(visible, () => {
    if (visible) {
      if (unminimizeProps !== undefined) {
        const { height, width, x, y } = unminimizeProps;
        animate(ANIMATION_DURATION);
        setMinimized(false);
        setSize(width, height);
        setPosition(x, y, width, true);
      }
    } else {
      animate(ANIMATION_DURATION);
      setUnminimizeProps({ ...position, ...size });
      setMinimized(true);
      setSize(0, 0, true);

      if (minimizedTopPosition !== undefined) {
        setPosition(0, minimizedTopPosition, width);
      }
    }
  });

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
    <div className={className} onMouseDown={() => onSelect(id)} style={style}>
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
