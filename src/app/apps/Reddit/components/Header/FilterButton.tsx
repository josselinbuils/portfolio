import cn from 'classnames';
import React, { FC } from 'react';
import { RedditFilter } from '../../interfaces';
import commonStyles from '../common.module.scss';
import styles from './FilterButton.module.scss';

const filters: RedditFilter[] = ['hot', 'top'];

const labelMap = {
  hot: <i className="fas fa-fire-alt" />,
  top: <i className="fas fa-chart-bar" />
};

export const FilterButton: FC<Props> = ({ filter, onClick }) => {
  const otherFilter = filters.find(f => f !== filter) as RedditFilter;

  return (
    <button
      className={cn(commonStyles.buttonLink, styles.filterButton)}
      onClick={() => onClick(otherFilter)}
    >
      {labelMap[otherFilter]}
    </button>
  );
};

interface Props {
  filter: RedditFilter;
  onClick(filter: RedditFilter): void;
}
