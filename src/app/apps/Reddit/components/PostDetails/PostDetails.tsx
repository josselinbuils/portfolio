import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../../common.module.scss';
import styles from './PostDetails.module.scss';

export const PostDetails: FC<Props> = ({
  author,
  onSubredditClick,
  showSubreddit,
  since,
  stickied,
  subreddit
}) => (
  <div className={styles.details}>
    <span>
      Posted {since} by {author}
    </span>
    {showSubreddit && (
      <>
        <span> on </span>
        <button
          className={commonStyles.buttonLink}
          onClick={() => onSubredditClick(subreddit)}
        >
          {subreddit}
        </button>
      </>
    )}
    {stickied && <i className={cn('fas fa-anchor', styles.anchor)} />}
  </div>
);

interface Props {
  author: string;
  onSubredditClick: (subreddit: string) => void;
  showSubreddit: boolean;
  since: string;
  stickied: boolean;
  subreddit: string;
}
