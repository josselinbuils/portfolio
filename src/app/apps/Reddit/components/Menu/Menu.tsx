import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../common.module.scss';
import styles from './Menu.module.scss';
import { uppercaseFirstLetter } from '~/apps/Reddit/utils';

const subreddits = [
  'popular',
  'CrappyDesign',
  'evilbuildings',
  'ProgrammerHumor',
  'todayilearned'
];

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
