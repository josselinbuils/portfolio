import cn from 'classnames';
import { type FC } from 'preact/compat';

import { JamendoLink } from './components/JamendoLink/JamendoLink';
import { Logo } from './components/Logo/Logo';
import { Menu, type MenuProps } from './components/Menu/Menu';
import styles from './Sidebar.module.scss';

export interface SidebarProps extends MenuProps {
  className?: string;
}

export const Sidebar: FC<SidebarProps> = ({
  activeMusicList,
  className,
  onClickMusicList,
}) => (
  <aside className={cn(styles.sidebar, className)}>
    <Logo />
    <Menu
      activeMusicList={activeMusicList}
      onClickMusicList={onClickMusicList}
    />
    <JamendoLink />
  </aside>
);
