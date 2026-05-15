import cn from 'classnames';
import { type FunctionComponent } from 'preact';

import { JamendoLink } from './components/JamendoLink/JamendoLink';
import { Logo } from './components/Logo/Logo';
import { Menu, type MenuProps } from './components/Menu/Menu';
import classes from './Sidebar.module.css';

export type SidebarProps = MenuProps & {
  className?: string;
};

export const Sidebar: FunctionComponent<SidebarProps> = ({
  activeMusicList,
  className,
  onClickMusicList,
}) => (
  <aside className={cn(classes.sidebar, className)}>
    <Logo />
    <Menu
      activeMusicList={activeMusicList}
      onClickMusicList={onClickMusicList}
    />
    <JamendoLink />
  </aside>
);
