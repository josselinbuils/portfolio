import { type FunctionComponent } from 'preact';

import { type RedditFilter } from '../../interfaces/RedditFilter';
import { Icon } from '../Icon/Icon';
import { FilterButton } from './FilterButton';
import styles from './Header.module.scss';

export interface HeaderProps {
  filter: RedditFilter;
  onClickFilter(filter: RedditFilter): void;
  subreddit: string;
}

export const Header: FunctionComponent<HeaderProps> = ({
  filter,
  onClickFilter,
  subreddit,
}) => (
  <header className={styles.header}>
    <h1 className={styles.path}>
      <Icon subreddit={subreddit} />
      <span>
        {subreddit}/{filter}
      </span>
    </h1>
    <FilterButton filter={filter} onClick={onClickFilter} />
  </header>
);
