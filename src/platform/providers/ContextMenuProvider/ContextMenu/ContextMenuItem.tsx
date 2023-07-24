import { type FC } from 'preact/compat';
import { type ContextMenuItemDescriptor } from '../ContextMenuItemDescriptor';
import styles from './ContextMenuItem.module.scss';

export interface ContextMenuItemProps extends ContextMenuItemDescriptor {
  active: boolean;
  onMouseMove(): void;
}

export const ContextMenuItem: FC<ContextMenuItemProps> = ({
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
