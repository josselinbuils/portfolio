import cn from 'classnames';
import React, { FC, useLayoutEffect, useState } from 'react';
import { uppercaseFirstLetter } from '../../utils';
import commonStyles from '../common.module.scss';
import styles from './MenuItem.module.scss';
import { Icon } from '~/apps/Reddit/components/Icon';

export const MenuItem: FC<Props> = ({
  activeSubreddit,
  onClickSubreddit,
  subreddit
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
    <button
      className={cn(commonStyles.buttonLink, styles.item)}
      disabled={isActiveSubreddit}
      onClick={() => onClickSubreddit(subreddit)}
      onMouseEnter={() => setOverflew(true)}
      onMouseLeave={() => setOverflew(false)}
    >
      <Icon active={isActiveSubreddit || overflew} subreddit={subreddit} />
      <span className={cn({ [styles.active]: isActiveSubreddit })}>
        {uppercaseFirstLetter(subreddit.slice(2))}
      </span>
    </button>
  );
};

interface Props {
  activeSubreddit: string;
  onClickSubreddit: (subreddit: string) => void;
  subreddit: string;
}
