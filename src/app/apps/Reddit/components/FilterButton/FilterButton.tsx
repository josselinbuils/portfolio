import React, { FC } from 'react';
import { RedditFilter } from '../../interfaces';
import commonStyles from '../../common.module.scss';

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

function uppercaseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
