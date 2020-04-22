import cn from 'classnames';
import React, { FC } from 'react';
import { ROOT_FONT_SIZE_PX } from '~/platform/constants';
import { TooltipDescriptor } from './TooltipDescriptor';

import styles from './Tooltip.module.scss';

export const Tooltip: FC<TooltipDescriptor> = ({
  className,
  position,
  style,
  title,
}) => {
  if (position === undefined) {
    return null;
  }
  const { x, y } = position;

  return (
    <div
      className={cn(styles.tooltip, className)}
      style={{
        ...style,
        left: `${x / ROOT_FONT_SIZE_PX}rem`,
        top: `${y / ROOT_FONT_SIZE_PX}rem`,
      }}
    >
      {title}
    </div>
  );
};
