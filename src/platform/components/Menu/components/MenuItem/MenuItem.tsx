import { type FunctionComponent, type JSX } from 'preact';

import styles from './MenuItem.module.scss';

export interface MenuItemDescriptor {
  onClick(): void;
  title: JSX.Element | string;
}

export interface MenuItemProps extends MenuItemDescriptor {
  active: boolean;
  onMouseMove(): void;
}

export const MenuItem: FunctionComponent<MenuItemProps> = ({
  active,
  onClick,
  onMouseMove,
  title,
}) => (
  <li className={styles.item} role="none">
    <button
      aria-current={active}
      className={styles.button}
      onClick={onClick}
      onMouseMove={onMouseMove}
      role="menuitem"
      tabIndex={-1}
      type="button"
    >
      <div className={styles.title}>{title}</div>
    </button>
  </li>
);
