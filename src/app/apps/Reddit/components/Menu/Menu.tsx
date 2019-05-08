import cn from 'classnames';
import React, { FC } from 'react';
import { subreddits } from '../../subreddits';
import { uppercaseFirstLetter } from '../../utils';
import commonStyles from '../common.module.scss';
import styles from './Menu.module.scss';

export const Menu: FC<Props> = ({ onClickSubreddit }) => (
  <nav className={styles.menu}>
    {subreddits.map(subreddit => (
      <button
        className={cn(commonStyles.buttonLink, styles.item)}
        key={subreddit}
        onClick={() => onClickSubreddit(`r/${subreddit}`)}
      >
        {uppercaseFirstLetter(subreddit)}
      </button>
    ))}
  </nav>
);

interface Props {
  onClickSubreddit: (subreddit: string) => void;
}
