import { FC } from 'react';
import { subreddits } from '../../subreddits';
import styles from './Menu.module.scss';
import { MenuItem } from './MenuItem';

export const Menu: FC<Props> = ({ activeSubreddit, onClickSubreddit }) => (
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

interface Props {
  activeSubreddit: string;
  onClickSubreddit(subreddit: string): void;
}
