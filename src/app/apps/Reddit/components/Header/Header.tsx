import React, { FC } from 'react';
import { RedditFilter } from '../../interfaces';
import { Icon } from '../Icon';
import { FilterButton } from './FilterButton';
import styles from './Header.module.scss';

export const Header: FC<Props> = ({ filter, onClickFilter, subreddit }) => (
  <header className={styles.header}>
    <h1 className={styles.path}>
      <Icon size={28} subreddit={subreddit} />
      <span>
        {subreddit}/{filter}
      </span>
    </h1>
    <FilterButton filter={filter} onClick={onClickFilter} />
  </header>
);

interface Props {
  filter: RedditFilter;
  onClickFilter: (filter: RedditFilter) => void;
  subreddit: string;
}
