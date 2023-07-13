import { faChartBar } from '@fortawesome/free-solid-svg-icons/faChartBar';
import { faFireAlt } from '@fortawesome/free-solid-svg-icons/faFireAlt';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FC } from 'preact/compat';
import { ButtonLink } from '@/platform/components/ButtonLink/ButtonLink';
import { type RedditFilter } from '../../interfaces/RedditFilter';
import styles from './FilterButton.module.scss';

const filters: RedditFilter[] = ['hot', 'top'];

const labelMap = {
  hot: <FontAwesomeIcon icon={faFireAlt} />,
  top: <FontAwesomeIcon icon={faChartBar} />,
};

export const FilterButton: FC<Props> = ({ filter, onClick }) => {
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

interface Props {
  filter: RedditFilter;
  onClick(filter: RedditFilter): void;
}
