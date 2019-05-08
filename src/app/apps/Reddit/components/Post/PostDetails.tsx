import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../common.module.scss';
import styles from './PostDetails.module.scss';

export const PostDetails: FC<Props> = ({
  author,
  onClickSubreddit,
  since,
  stickied,
  subreddit
}) => (
  <div className={styles.details}>
    <span>
      Posted <time>{since}</time> by {author}
    </span>
    {subreddit !== 'popular' && (
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
  since: string;
  stickied: boolean;
  subreddit: string;
}
