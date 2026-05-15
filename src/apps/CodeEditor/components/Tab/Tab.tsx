import { faFileCode } from '@fortawesome/free-solid-svg-icons/faFileCode';
import cn from 'classnames';
import { type FunctionComponent, type JSX } from 'preact';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import classes from './Tab.module.css';

export type TabProps = JSX.HTMLAttributes<HTMLButtonElement> & {
  className?: string;
  selected: boolean;
};

export const Tab: FunctionComponent<TabProps> = ({
  children,
  className,
  selected,
  ...forwardedProps
}) => (
  <button
    aria-selected={selected}
    className={cn(classes.tab, className)}
    role="tab"
    type="button"
    {...forwardedProps}
  >
    <FontAwesomeIcon className={classes.icon} icon={faFileCode} />
    {children}
  </button>
);
