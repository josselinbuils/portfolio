import cn from 'classnames';
import React, { FC } from 'react';

import styles from './Toolbar.module.scss';

export const Toolbar: FC<Props> = ({ children, className }) => {
  return <div className={cn(styles.toolbar, className)}>{children}</div>;
};

interface Props {
  className?: string;
}
