import { type FunctionComponent, type JSX } from 'preact';

import classes from './MenuItem.module.css';

export type MenuItemDescriptor = {
  onClick(): void;
  title: JSX.Element | string;
};

export type MenuItemProps = MenuItemDescriptor & {
  active: boolean;
  onMouseMove(): void;
};

export const MenuItem: FunctionComponent<MenuItemProps> = ({
  active,
  onClick,
  onMouseMove,
  title,
}) => (
  <li className={classes.item} role="none">
    <button
      aria-current={active}
      className={classes.button}
      onClick={onClick}
      onMouseMove={onMouseMove}
      role="menuitem"
      tabIndex={-1}
      type="button"
    >
      <div className={classes.title}>{title}</div>
    </button>
  </li>
);
