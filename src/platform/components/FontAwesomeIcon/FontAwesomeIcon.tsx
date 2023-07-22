import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import cn from 'classnames';
import { forwardRef, type HTMLAttributes } from 'preact/compat';
import styles from './FontAwesomeIcon.module.scss';

export interface FontAwesomeIconProps
  extends Omit<HTMLAttributes<SVGSVGElement>, 'icon'> {
  className?: string;
  icon: IconDefinition;
}

export const FontAwesomeIcon = forwardRef<SVGSVGElement, FontAwesomeIconProps>(
  ({ className, icon, ...forwardedProps }, ref) => {
    const [width, height, , , svgPathData] = icon.icon;
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        className={cn(styles.icon, className)}
        ref={ref}
        {...forwardedProps}
      >
        <path fill="currentColor" d={svgPathData as string} />
      </svg>
    );
  },
);
