import { type FunctionComponent } from 'preact';

import { subreddits } from '../../subreddits';
import styles from './Menu.module.css';
import { MenuItem } from './MenuItem';

export type MenuProps = {
  activeSubreddit: string;
  onClickSubreddit(subreddit: string): void;
};

export const Menu: FunctionComponent<MenuProps> = ({
  activeSubreddit,
  onClickSubreddit,
}) => (
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
