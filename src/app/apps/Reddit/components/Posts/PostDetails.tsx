import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../common.module.scss';
import styles from './PostDetails.module.scss';

export const PostDetails: FC<Props> = ({
  author,
  currentSubreddit,
  onClickSubreddit,
  since,
  stickied,
  subreddit
}) => (
  <div className={styles.details}>
    {currentSubreddit === 'r/popular' && (
      <button
        className={cn(commonStyles.buttonLink, styles.subreddit)}
        onClick={() => onClickSubreddit(subreddit)}
      >
        {subreddit}
      </button>
    )}
    <span>
      Posted <time>{since}</time> by {author}
    </span>
    {stickied && <i className={cn('fas fa-anchor', styles.anchor)} />}
  </div>
);

interface Props {
  author: string;
  currentSubreddit: string;
  onClickSubreddit: (subreddit: string) => void;
  since: string;
  stickied: boolean;
  subreddit: string;
}
