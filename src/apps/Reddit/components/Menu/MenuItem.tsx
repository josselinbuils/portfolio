import cn from 'classnames';
import { type FC, useLayoutEffect, useState } from 'preact/compat';
import { ButtonLink } from '@/platform/components/ButtonLink/ButtonLink';
import { uppercaseFirstLetter } from '../../utils/uppercaseFirstLetter';
import { Icon } from '../Icon/Icon';
import styles from './MenuItem.module.scss';

export const MenuItem: FC<Props> = ({
  activeSubreddit,
  onClickSubreddit,
  subreddit,
}) => {
  const [overflew, setOverflew] = useState(false);
  const isActiveSubreddit = subreddit === activeSubreddit;

  useLayoutEffect(() => {
    // When button will be disabled, onMouseLeave will not be triggered anymore
    if (isActiveSubreddit && overflew) {
      setOverflew(false);
    }
  }, [isActiveSubreddit, overflew]);

  return (
    <ButtonLink
      className={styles.item}
      disabled={isActiveSubreddit}
      onClick={() => onClickSubreddit(subreddit)}
      onMouseEnter={() => setOverflew(true)}
      onMouseLeave={() => setOverflew(false)}
    >
      <Icon active={isActiveSubreddit || overflew} subreddit={subreddit} />
      <span className={cn({ [styles.active]: isActiveSubreddit })}>
        {uppercaseFirstLetter(subreddit.slice(2))}
      </span>
    </ButtonLink>
  );
};

interface Props {
  activeSubreddit: string;
  subreddit: string;
  onClickSubreddit(subreddit: string): void;
}
