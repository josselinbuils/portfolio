import React, { FC } from 'react';
import { RedditFilter } from '../../interfaces';
import { FilterButton } from './FilterButton';
import styles from './Header.module.scss';

export const Header: FC<Props> = ({ filter, onClickFilter, subreddit }) => (
  <header className={styles.header}>
    <h1 className={styles.path}>
      {filter}/{subreddit}
    </h1>
    <FilterButton filter={filter} onClick={onClickFilter} />
  </header>
);

interface Props {
  filter: RedditFilter;
  onClickFilter: (filter: RedditFilter) => void;
  subreddit: string;
}
