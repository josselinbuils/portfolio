import cn from 'classnames';
import { type CSSProperties, type JSX } from 'preact';
import { forwardRef } from 'preact/compat';

import { ROOT_FONT_SIZE_PX } from '@/platform/constants';
import { type Position } from '@/platform/interfaces/Position';

import styles from './Tooltip.module.scss';

export type TooltipProps = {
  className?: string;
  position: Position<number>;
  relativePosition?: 'bottom-right' | 'right';
  style?: CSSProperties;
  title: JSX.Element | string;
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, position, relativePosition = 'right', style, title }, ref) => {
    const { x, y } = position;

    return (
      <div
        className={cn(styles.tooltip, styles[relativePosition], className)}
        ref={ref}
        style={{
          ...style,
          left: `${x / ROOT_FONT_SIZE_PX}rem`,
          top: `${y / ROOT_FONT_SIZE_PX}rem`,
        }}
      >
        {title}
      </div>
    );
  },
);
