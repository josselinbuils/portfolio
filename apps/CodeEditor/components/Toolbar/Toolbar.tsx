import cn from 'classnames';
import type { FC, ReactElement } from 'react';
import { Children, cloneElement } from 'react';
import styles from './Toolbar.module.scss';

export const Toolbar: FC<Props> = ({ children, className }) => (
  <div className={cn(styles.toolbar, className)}>
    {Children.map(children, (child: ReactElement) =>
      cloneElement(child, {
        className: cn(child.props.className, styles.toolButton),
      })
    )}
  </div>
);

interface Props {
  children: ReactElement | ReactElement[];
  className?: string;
}
