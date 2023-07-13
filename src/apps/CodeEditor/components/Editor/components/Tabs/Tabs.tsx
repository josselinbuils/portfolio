import cn from 'classnames';
import { type FC, type ReactElement } from 'react';
import { Children, cloneElement } from 'react';
import styles from './Tabs.module.scss';

export const Tabs: FC<Props> = ({ children, className, label }) => (
  <div aria-label={label} className={cn(styles.tabs, className)} role="tablist">
    {Children.map(children, (child: ReactElement) =>
      cloneElement(child, {
        className: cn(child.props.className, styles.tab),
      }),
    )}
  </div>
);

interface Props {
  children: ReactElement | ReactElement[];
  className?: string;
  label: string;
}
