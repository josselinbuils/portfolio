import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useLayoutEffect, useRef } from 'react';
import { ContextMenuItemDescriptor } from '../ContextMenuItemDescriptor';

import styles from './ContextMenuItem.module.scss';

export const ContextMenuItem: FC<Props> = ({
  active,
  onClick,
  onMouseMove,
  icon,
  tabIndex,
  title,
}) => {
  const itemRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (active && itemRef.current) {
      itemRef.current.focus();
    }
  }, [active]);

  return (
    <li className={styles.item} role="none">
      <button
        aria-current={active}
        className={styles.button}
        onClick={onClick}
        onMouseMove={onMouseMove}
        ref={itemRef}
        role="menuitem"
        tabIndex={tabIndex}
        type="button"
      >
        <div className={styles.icon}>
          {icon && <FontAwesomeIcon icon={icon} />}
        </div>
        <div className={styles.title}>{title}</div>
      </button>
    </li>
  );
};

interface Props extends ContextMenuItemDescriptor {
  active: boolean;
  tabIndex: number;
  onMouseMove(): void;
}
