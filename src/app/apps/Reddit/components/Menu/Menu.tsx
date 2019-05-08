import cn from 'classnames';
import React, { FC } from 'react';
import { subreddits } from '../../subreddits';
import { uppercaseFirstLetter } from '../../utils';
import commonStyles from '../common.module.scss';
import styles from './Menu.module.scss';

export const Menu: FC<Props> = ({ activeSubreddit, onClickSubreddit }) => {
  const isActive = (subreddit: string) => subreddit === activeSubreddit;

  return (
    <nav className={styles.menu}>
      {subreddits.map(subreddit => (
        <button
          className={cn(commonStyles.buttonLink, styles.item, {
            [commonStyles.active]: isActive(subreddit)
          })}
          disabled={isActive(subreddit)}
          key={subreddit}
          onClick={() => onClickSubreddit(subreddit)}
        >
          {uppercaseFirstLetter(subreddit.slice(2))}
        </button>
      ))}
    </nav>
  );
};

interface Props {
  activeSubreddit: string;
  onClickSubreddit: (subreddit: string) => void;
}
