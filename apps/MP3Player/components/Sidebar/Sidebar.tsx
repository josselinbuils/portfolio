import cn from 'classnames';
import { FC } from 'react';
import { Logo } from './components/Logo/Logo';
import { Menu, type MenuProps } from './components/Menu/Menu';
import { JamendoLink } from './components/JamendoLink/JamendoLink';

import styles from './Sidebar.module.scss';

interface Props extends MenuProps {
  className?: string;
  isMobile: boolean;
  isVisible: boolean;
}

export const Sidebar: FC<Props> = ({
  className,
  activeMusicList,
  isMobile,
  isVisible,
  onClickMusicList,
}) => (
  <>
    <aside
      className={cn(styles.sidebar, className, {
        [styles.mobile]: isMobile,
        [styles.visible]: isVisible,
      })}
    >
      <Logo />
      <Menu
        activeMusicList={activeMusicList}
        onClickMusicList={onClickMusicList}
      />
      <JamendoLink />
    </aside>
    {isMobile && (
      <button
        aria-label="sidebar overlay"
        onClick={() => onClickMusicList(activeMusicList)}
        className={cn(styles.overlay, { [styles.visible]: isVisible })}
        type="button"
      />
    )}
  </>
);
