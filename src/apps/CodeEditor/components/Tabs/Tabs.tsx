import cn from 'classnames';
import { cloneElement, type FunctionComponent, type JSX } from 'preact';
import { Children } from 'preact/compat';

import classes from './Tabs.module.css';

export type TabsProps = {
  children: JSX.Element | JSX.Element[];
  className?: string;
};

export const Tabs: FunctionComponent<TabsProps> = ({ children, className }) => (
  <div aria-label="tabs" className={cn(classes.tabs, className)} role="tablist">
    {Children.map(children, (child: JSX.Element) =>
      cloneElement(child, {
        className: cn(child.props.className, classes.tab),
      }),
    )}
  </div>
);
