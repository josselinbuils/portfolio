import React, { FC } from 'react';
import { subreddits } from '../../subreddits';
import { MenuItem } from './MenuItem';

import styles from './Menu.module.scss';

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
