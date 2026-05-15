import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import cn from 'classnames';
import { type HTMLAttributes } from 'preact';
import { forwardRef } from 'preact/compat';

import classes from './FontAwesomeIcon.module.css';

export type FontAwesomeIconProps = Omit<
  HTMLAttributes<SVGSVGElement>,
  'icon'
> & {
  className?: string;
  icon: IconDefinition;
};

export const FontAwesomeIcon = forwardRef<SVGSVGElement, FontAwesomeIconProps>(
  ({ className, icon, ...forwardedProps }, ref) => {
    const [width, height, , , svgPathData] = icon.icon;
    return (
      <svg
        aria-hidden="true"
        className={cn(classes.icon, className)}
        focusable="false"
        ref={ref}
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        {...forwardedProps}
      >
        <path d={svgPathData as string} fill="currentColor" />
      </svg>
    );
  },
);
