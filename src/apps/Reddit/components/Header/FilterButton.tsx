import { faChartBar } from '@fortawesome/free-solid-svg-icons/faChartBar';
import { faFireAlt } from '@fortawesome/free-solid-svg-icons/faFireAlt';
import { type FunctionComponent } from 'preact';

import { ButtonLink } from '@/platform/components/ButtonLink/ButtonLink';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import { type RedditFilter } from '../../interfaces/RedditFilter';
import styles from './FilterButton.module.css';

const filters: RedditFilter[] = ['hot', 'top'];

const labelMap = {
  hot: <FontAwesomeIcon icon={faFireAlt} />,
  top: <FontAwesomeIcon icon={faChartBar} />,
};

export type FilterButtonProps = {
  filter: RedditFilter;
  onClick(filter: RedditFilter): void;
};

export const FilterButton: FunctionComponent<FilterButtonProps> = ({
  filter,
  onClick,
}) => {
  const otherFilter = filters.find((f) => f !== filter) as RedditFilter;

  return (
    <ButtonLink
      className={styles.filterButton}
      onClick={() => onClick(otherFilter)}
    >
      {labelMap[otherFilter]}
    </ButtonLink>
  );
};
