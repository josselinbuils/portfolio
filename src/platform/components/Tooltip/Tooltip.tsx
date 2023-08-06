import cn from 'classnames';
import { forwardRef, type CSSProperties, type JSX } from 'preact/compat';
import { ROOT_FONT_SIZE_PX } from '@/platform/constants';
import type { Position } from '@/platform/interfaces/Position';
import styles from './Tooltip.module.scss';

export interface TooltipProps {
  className?: string;
  position: Position;
  relativePosition?: 'bottom-right' | 'right';
  style?: CSSProperties;
  title: string | JSX.Element;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, position, relativePosition = 'right', style, title }, ref) => {
    const { x, y } = position;

    return (
      <div
        className={cn(styles.tooltip, styles[relativePosition], className)}
        style={{
          ...style,
          left: typeof x === 'string' ? x : `${x / ROOT_FONT_SIZE_PX}rem`,
          top: typeof y === 'string' ? y : `${y / ROOT_FONT_SIZE_PX}rem`,
        }}
        ref={ref}
      >
        {title}
      </div>
    );
  },
);
