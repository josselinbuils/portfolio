import cn from 'classnames';
import { Children, cloneElement, type FC, type JSX } from 'preact/compat';
import styles from './Tabs.module.scss';

export interface TabsProps {
  children: JSX.Element | JSX.Element[];
  className?: string;
  label: string;
}

export const Tabs: FC<TabsProps> = ({ children, className, label }) => (
  <div aria-label={label} className={cn(styles.tabs, className)} role="tablist">
    {Children.map(children, (child: JSX.Element) =>
      cloneElement(child, {
        className: cn(child.props.className, styles.tab),
      }),
    )}
  </div>
);
