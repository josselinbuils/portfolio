import React, { FC, useRef } from 'react';
import { Size } from '~/platform/interfaces';
import { WindowStatic, WindowStaticProps } from './components/WindowStatic';
import { Movable, Resizable } from './providers';

export const Window: FC<Props> = ({
  keepContentRatio = false,
  maxHeight = Infinity,
  maxWidth = Infinity,
  minHeight,
  minimizedTopPosition = 0,
  minWidth,
  visibleAreaSize,
  ...windowProps
}) => {
  const windowRef = useRef<HTMLDivElement>(null);

  return (
    <Resizable
      keepContentRatio={keepContentRatio}
      maxHeight={maxHeight}
      maxWidth={maxWidth}
      minHeight={minHeight}
      minWidth={minWidth}
      visibleAreaSize={visibleAreaSize}
    >
      {({ size, ...otherResizableProps }) => (
        <Movable
          minimizedTopPosition={minimizedTopPosition}
          size={size}
          visibleAreaSize={visibleAreaSize}
          windowRef={windowRef}
        >
          {movableProps => (
            <WindowStatic
              {...windowProps}
              {...otherResizableProps}
              {...movableProps}
              ref={windowRef}
              size={size}
            />
          )}
        </Movable>
      )}
    </Resizable>
  );
};

interface Props extends WindowStaticProps {
  keepContentRatio?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  minHeight: number;
  minimizedTopPosition?: number;
  minWidth: number;
  visibleAreaSize: Size;
}
