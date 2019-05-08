import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../common.module.scss';
import styles from './PostDetails.module.scss';

export const PostDetails: FC<Props> = ({
  author,
  onClickSubreddit,
  showSubreddit,
  since,
  stickied,
  subreddit
}) => (
  <div className={styles.details}>
    <span>
      Posted <time>{since}</time> by {author}
    </span>
    {showSubreddit && (
      <>
        <span> on </span>
        <button
          className={commonStyles.buttonLink}
          onClick={() => onClickSubreddit(subreddit)}
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
  onClickSubreddit: (subreddit: string) => void;
  showSubreddit: boolean;
  since: string;
  stickied: boolean;
  subreddit: string;
}
