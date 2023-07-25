import { type FunctionComponent } from 'preact/compat';
import styles from './MenuOverlay.module.scss';

export interface MenuOverlayProps {
  hideMenu(): unknown;
}

export const MenuOverlay: FunctionComponent<MenuOverlayProps> = ({
  hideMenu,
}) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  <div className={styles.overlay} onMouseDown={hideMenu} />
);
