import cn from 'classnames';
import { type FC } from 'preact/compat';
import styles from './Sidebar.module.scss';
import { JamendoLink } from './components/JamendoLink/JamendoLink';
import { Logo } from './components/Logo/Logo';
import { Menu, type MenuProps } from './components/Menu/Menu';

export interface SidebarProps extends MenuProps {
  className?: string;
}

export const Sidebar: FC<SidebarProps> = ({
  className,
  activeMusicList,
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
