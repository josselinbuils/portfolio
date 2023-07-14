import { faJsSquare } from '@fortawesome/free-brands-svg-icons/faJsSquare';
import cn from 'classnames';
import { type FC, type JSX } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon';
import styles from './Tab.module.scss';

export interface TabProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  selected: boolean;
}

export const Tab: FC<TabProps> = ({
  children,
  className,
  selected,
  ...forwardedProps
}) => (
  <button
    aria-selected={selected}
    className={cn(styles.tab, className)}
    role="tab"
    type="button"
    {...forwardedProps}
  >
    <FontAwesomeIcon className={styles.icon} icon={faJsSquare} />
    {children}
  </button>
);
