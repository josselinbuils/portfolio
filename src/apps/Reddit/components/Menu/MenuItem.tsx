import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { useLayoutEffect, useState } from 'preact/hooks';

import { ButtonLink } from '@/platform/components/ButtonLink/ButtonLink';

import { uppercaseFirstLetter } from '../../utils/uppercaseFirstLetter';
import { Icon } from '../Icon/Icon';
import styles from './MenuItem.module.css';

export type MenuItemProps = {
  activeSubreddit: string;
  onClickSubreddit(subreddit: string): void;
  subreddit: string;
};

export const MenuItem: FunctionComponent<MenuItemProps> = ({
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
