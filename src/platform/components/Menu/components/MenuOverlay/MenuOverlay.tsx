import { type FunctionComponent } from 'preact';

import classes from './MenuOverlay.module.css';

export type MenuOverlayProps = {
  hideMenu(): unknown;
};

export const MenuOverlay: FunctionComponent<MenuOverlayProps> = ({
  hideMenu,
}) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  <div className={classes.overlay} onMouseDown={hideMenu} />
);
