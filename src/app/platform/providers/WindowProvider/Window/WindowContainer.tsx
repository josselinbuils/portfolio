import React, {
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { MouseButton } from '~/platform/constants';
import { Size } from '~/platform/interfaces';
import { findClosestElement, noop } from '~/platform/utils';
import { ANIMATION_DURATION, BUTTONS_WIDTH, LEFT_OFFSET } from '../constants';

import {
  useAnimation,
  useEventListener,
  useMount,
  usePosition,
  useSize,
  useStore
} from './hooks';
import { getRefElement, getRefElementSize } from './utils';
import { Window } from './Window';

export const WindowContainer: FC<Props> = ({
  defaultSize,
  keepContentRatio = false,
  maxSize = { height: Infinity, width: Infinity },
  minSize = { height: 100, width: 100 },
  onResize = noop,
  resizable = true,
  visible,
  ...rest
}) => {
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const [animationDurationMs, animate] = useAnimation();
  const listenEvent = useEventListener();
  const [position, setPosition] = usePosition(windowRef);
  const lastDisplayProperties = useStore<DisplayProperties>();
  const [size, setSize, setMaxSize] = useSize(
    defaultSize,
    maxSize,
    minSize,
    keepContentRatio,
    windowRef,
    contentRef,
    onResize
  );

  const toggleMaximize = useCallback(
    (
      keepPosition: boolean = false,
      animationDuration: number = ANIMATION_DURATION
    ) => {
      if (!resizable) {
        return;
      }

      animate(animationDuration);

      if (maximized && lastDisplayProperties.maximize !== undefined) {
        const { left, top, width, height } = lastDisplayProperties.maximize;

        if (!keepPosition) {
          setPosition(left, top);
        }
        setSize(width, height);

        delete lastDisplayProperties.maximize;
      } else {
        const windowElement = getRefElement(windowRef);
        lastDisplayProperties.maximize = windowElement.getBoundingClientRect();

        if (!keepPosition) {
          setPosition(LEFT_OFFSET, 0);
        }
        setMaxSize();
      }
      setMaximized(!maximized);
    },
    [
      animate,
      lastDisplayProperties,
      maximized,
      resizable,
      setMaxSize,
      setPosition,
      setSize
    ]
  );

  useEffect(() => {
    animate(ANIMATION_DURATION);

    if (visible) {
      if (lastDisplayProperties.minimize !== undefined) {
        const { left, top, width, height } = lastDisplayProperties.minimize;
        setMinimized(false);
        setSize(width, height);
        setPosition(left, top, true);
      }
    } else {
      const windowElement = getRefElement(windowRef);
      lastDisplayProperties.minimize = windowElement.getBoundingClientRect();
      setMinimized(true);
      setSize(0, 0, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useMount(() => {
    const windowSize = getRefElementSize(windowRef);
    const width = size !== undefined ? size.width : windowSize.width;
    const height = size !== undefined ? size.height : windowSize.height;

    setSize(width, height);

    const x = Math.round((window.innerWidth - width) * 0.5);
    const y = Math.round((window.innerHeight - height) * 0.2);

    setPosition(x, y);
  });

  const onMoveStart = useCallback(
    (downEvent: MouseEvent) => {
      if (downEvent.button !== MouseButton.Left) {
        return;
      }

      downEvent.preventDefault();
      downEvent.persist();

      const target = downEvent.target as HTMLElement;

      if (findClosestElement(target, '.button') !== undefined) {
        return;
      }

      const windowElement = getRefElement(windowRef);
      const windowBoundingRect = windowElement.getBoundingClientRect();
      const dy = windowBoundingRect.top - downEvent.clientY;
      let dx = windowBoundingRect.left - downEvent.clientX;

      // this.setSelectable(false);

      const cancelMouseMove = listenEvent(
        window,
        'mousemove',
        (moveEvent: MouseEvent) => {
          // Sometimes a move event is triggered with down event, to verify with
          // react
          if (
            moveEvent.clientX === downEvent.clientX &&
            moveEvent.clientY === downEvent.clientY
          ) {
            return;
          }
          // maximized value is always the one when the listener was registered
          // working because lastDisplayProperties.maximize is deleted but
          // should find a cleaner way
          if (maximized && lastDisplayProperties.maximize !== undefined) {
            const offsetX = downEvent.nativeEvent.offsetX;
            const widthRatio =
              lastDisplayProperties.maximize.width / windowBoundingRect.width;

            // Keeps the same position on the title bar in proportion to its width
            dx +=
              offsetX * widthRatio > BUTTONS_WIDTH
                ? offsetX * (1 - widthRatio)
                : offsetX - BUTTONS_WIDTH;

            toggleMaximize(true, 50);
          }
          setPosition(moveEvent.clientX + dx, moveEvent.clientY + dy);
        }
      );

      const cancelMouseUp = listenEvent(window, 'mouseup', () => {
        // this.setSelectable(true);
        cancelMouseMove();
        cancelMouseUp();
      });
    },
    [lastDisplayProperties, listenEvent, maximized, setPosition, toggleMaximize]
  );

  return (
    <Window
      {...rest}
      animationDurationMs={animationDurationMs}
      centered={position === undefined}
      contentRef={contentRef}
      maximized={maximized}
      minimized={minimized}
      onMaximize={toggleMaximize}
      onMoveStart={onMoveStart}
      onResizeStart={() => {}}
      position={position}
      ref={windowRef}
      resizable={true}
      size={size}
    />
  );
};

interface DisplayProperties {
  maximize?: ClientRect;
  minimize?: ClientRect;
}

interface Props {
  active: boolean;
  background: string;
  defaultSize?: Size;
  keepContentRatio?: boolean;
  maxSize?: Size;
  minSize?: Size;
  resizable?: boolean;
  titleBackground: string;
  titleColor: string;
  visible: boolean;
  windowTitle: string;
  zIndex: number;
  onClose(): void;
  onMinimise(): void;
  onResize?(size: { width: number; height: number }): void;
  onSelect(): void;
}
