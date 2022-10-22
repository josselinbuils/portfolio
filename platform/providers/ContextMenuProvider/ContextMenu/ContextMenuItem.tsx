import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import type { FC } from 'react';
import type { ContextMenuItemDescriptor } from '../ContextMenuItemDescriptor';
import styles from './ContextMenuItem.module.scss';

export const ContextMenuItem: FC<Props> = ({
  active,
  onClick,
  onMouseMove,
  icon,
  title,
}) => (
  <li className={styles.item} role="none">
    <button
      aria-current={active}
      className={cn(styles.button, { [styles.active]: active })}
      onClick={onClick}
      onMouseMove={onMouseMove}
      role="menuitem"
      tabIndex={-1}
      type="button"
    >
      <div className={styles.icon}>
        {icon && <FontAwesomeIcon icon={icon} />}
      </div>
      <div className={styles.title}>{title}</div>
    </button>
  </li>
);

interface Props extends ContextMenuItemDescriptor {
  active: boolean;
  onMouseMove(): void;
}
