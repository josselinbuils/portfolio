import { type FC } from 'preact/compat';
import { subreddits } from '../../subreddits';
import styles from './Menu.module.scss';
import { MenuItem } from './MenuItem';

export interface MenuProps {
  activeSubreddit: string;
  onClickSubreddit(subreddit: string): void;
}

export const Menu: FC<MenuProps> = ({ activeSubreddit, onClickSubreddit }) => (
  <nav className={styles.menu}>
    {subreddits.map((subreddit) => (
      <MenuItem
        activeSubreddit={activeSubreddit}
        key={subreddit}
        onClickSubreddit={onClickSubreddit}
        subreddit={subreddit}
      />
    ))}
  </nav>
);
