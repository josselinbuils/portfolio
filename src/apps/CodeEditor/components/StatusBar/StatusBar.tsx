import cn from 'classnames';
import React, { FC } from 'react';

import styles from './StatusBar.module.scss';

export const StatusBar: FC<Props> = ({ className }) => (
  <div className={cn(styles.statusBar, className)} />
);

interface Props {
  className?: string;
}
