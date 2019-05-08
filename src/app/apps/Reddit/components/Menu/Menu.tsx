import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../common.module.scss';
import styles from './Menu.module.scss';

const subreddits = [
  'r/popular',
  'r/Angular2',
  'r/CrappyDesign',
  'r/docker',
  'r/javascript',
  'r/node',
  'r/ProgrammerHumor',
  'r/reactjs',
  'r/todayilearned'
];

export const Menu: FC<Props> = ({ onClickSubreddit }) => (
  <nav className={styles.menu}>
    {subreddits.map(subreddit => (
      <button
        className={cn(commonStyles.buttonLink, styles.item)}
        key={subreddit}
        onClick={() => onClickSubreddit(subreddit)}
      >
        {subreddit}
      </button>
    ))}
  </nav>
);

interface Props {
  onClickSubreddit: (subreddit: string) => void;
}