import { type FunctionComponent } from 'preact';

import { type RedditFilter } from '../../interfaces/RedditFilter';
import { Icon } from '../Icon/Icon';
import { FilterButton } from './FilterButton';
import classes from './Header.module.css';

export type HeaderProps = {
  filter: RedditFilter;
  onClickFilter(filter: RedditFilter): void;
  subreddit: string;
};

export const Header: FunctionComponent<HeaderProps> = ({
  filter,
  onClickFilter,
  subreddit,
}) => (
  <header className={classes.header}>
    <h1 className={classes.path}>
      <Icon subreddit={subreddit} />
      <span>
        {subreddit}/{filter}
      </span>
    </h1>
    <FilterButton filter={filter} onClick={onClickFilter} />
  </header>
);
