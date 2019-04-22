import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { getSize, startAnimation } from './utils';
import { Window } from './Window';

export const WindowContainer: FC<Props> = ({
  defaultHeight,
  defaultWidth,
  keepContentRatio = false,
  maxHeight,
  maxWidth,
  minHeight = 100,
  minWidth = 100,
  onResize = () => {},
  visible,
  ...rest
}) => {
  const [animate, setAnimate] = useState(false);
  const [contentRatio, setContentRatio] = useState<number | undefined>(
    undefined
  );
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [windowHeight, setWindowHeight] = useState<number | undefined>(
    defaultHeight
  );
  const [windowLeft, setWindowLeft] = useState(0);
  const [windowTop, setWindowTop] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number | undefined>(
    defaultWidth
  );
  const lastDisplayProperties = useMemo<DisplayProperties>(() => ({}), []);
  const contentRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const setPosition = useCallback(
    (x: number, y: number, force: boolean = false) => {
      if (!force) {
        // This cannot be done when showing again a minimized window because its
        // dimensions are null
        const xMin = -getSize(windowRef.current).width + 90;
        const yMin = -1;
        const xMax = window.innerWidth - 30;
        const yMax = window.innerHeight - 21;

        x = Math.min(Math.max(x, xMin), xMax);
        y = Math.min(Math.max(y, yMin), yMax);
      }

      setWindowLeft(x);
      setWindowTop(y);
    },
    [contentRatio, windowRef]
  );

  const setSize = useCallback(
    (width: number, height: number, force: boolean = false) => {
      if (!force) {
        width = Math.max(width, minWidth);
        height = Math.max(height, minHeight);

        if (maxWidth !== undefined) {
          width = Math.min(width, maxWidth);
        }

        if (maxHeight !== undefined) {
          height = Math.min(height, maxHeight);
        }

        if (contentRatio !== undefined) {
          const size = getSize(windowRef.current);
          const contentSize = getSize(contentRef.current);
          const dx = size.width - contentSize.width;
          const dy = size.height - contentSize.height;
          height = Math.round((width - dx) / contentRatio) + dy;
        }
      }

      setWindowWidth(width);
      setWindowHeight(height);
      onResize({ width, height });
    },
    [
      contentRatio,
      contentRef,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      windowRef
    ]
  );

  useEffect(() => {
    startAnimation()
      .ready(() => {
        if (visible) {
          if (lastDisplayProperties.minimize !== undefined) {
            const { left, top, width, height } = lastDisplayProperties.minimize;
            setMinimized(false);
            setSize(width, height);
            setPosition(left, top, true);
          }
        } else {
          const windowElement = windowRef.current;

          if (windowElement === null) {
            throw new Error('Unable to retrieve window element');
          }

          lastDisplayProperties.minimize = windowElement.getBoundingClientRect();
          setMinimized(true);
          setSize(0, 0, true);
        }
      })
      .finished(() => setAnimate(false));
  }, [visible]);

  useEffect(() => {
    const windowElement = windowRef.current;

    if (windowElement === null) {
      throw new Error('Unable to retrieve window element');
    }

    if (windowWidth === undefined) {
      setWindowWidth(getSize(windowElement).width);
    }

    if (windowHeight === undefined) {
      setWindowHeight(getSize(windowElement).height);
    }

    const x = Math.round(
      (window.innerWidth - getSize(windowElement).width) * 0.5
    );
    const y = Math.round(
      (window.innerHeight - getSize(windowElement).height) * 0.2
    );

    setPosition(x, y);

    if (keepContentRatio) {
      const contentSize = getSize(contentRef.current);
      setContentRatio(contentSize.width / contentSize.height);
    }
  }, []);

  return (
    <Window
      {...rest}
      animate={animate}
      contentRef={contentRef}
      height={windowHeight}
      left={windowLeft}
      maximized={maximized}
      minimized={minimized}
      onResizeStart={() => {}}
      ref={windowRef}
      top={windowTop}
      width={windowWidth}
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
  defaultHeight?: number;
  defaultWidth?: number;
  keepContentRatio?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  titleBackground: string;
  titleColor: string;
  visible: boolean;
  windowTitle: string;
  zIndex: number;
  onClose(): void;
  onMaximize(): void;
  onMinimise(): void;
  onResize?(size: { width: number; height: number }): void;
  onSelect(): void;
  onTitleDoubleClick(): void;
  onTitleMouseDown(): void;
}
