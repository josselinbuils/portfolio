import React, { FC } from 'react';
import { RedditFilter } from '../../interfaces';
import { uppercaseFirstLetter } from '../../utils';
import commonStyles from '../common.module.scss';

const filters: RedditFilter[] = ['hot', 'top'];

export const FilterButton: FC<Props> = ({ filter, onClick }) => {
  const otherFilter = filters.find(f => f !== filter) as RedditFilter;

  return (
    <button
      className={commonStyles.buttonLink}
      onClick={() => onClick(otherFilter)}
    >
      {uppercaseFirstLetter(otherFilter)}
    </button>
  );
};

interface Props {
  filter: RedditFilter;
  onClick: (filter: RedditFilter) => void;
}
