import { type FunctionComponent } from 'preact';

import styles from './MenuOverlay.module.css';

export type MenuOverlayProps = {
  hideMenu(): unknown;
};

export const MenuOverlay: FunctionComponent<MenuOverlayProps> = ({
  hideMenu,
}) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  <div className={styles.overlay} onMouseDown={hideMenu} />
);
