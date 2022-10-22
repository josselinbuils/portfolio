import cn from 'classnames';
import type { FC } from 'react';
import styles from './Sidebar.module.scss';
import { JamendoLink } from './components/JamendoLink/JamendoLink';
import { Logo } from './components/Logo/Logo';
import { Menu, type MenuProps } from './components/Menu/Menu';

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
