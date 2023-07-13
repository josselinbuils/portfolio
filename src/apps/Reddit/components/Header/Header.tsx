import { type FC } from 'preact/compat';
import { type RedditFilter } from '../../interfaces/RedditFilter';
import { Icon } from '../Icon/Icon';
import { FilterButton } from './FilterButton';
import styles from './Header.module.scss';

export const Header: FC<Props> = ({ filter, onClickFilter, subreddit }) => (
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

interface Props {
  filter: RedditFilter;
  subreddit: string;
  onClickFilter(filter: RedditFilter): void;
}
