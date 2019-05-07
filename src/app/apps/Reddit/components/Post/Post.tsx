import cn from 'classnames';
import React, { FC, MouseEvent } from 'react';
import { RedditPost } from '../../RedditPost';
import { PostDetails } from '../PostDetails';
import { formatNumber, getPreviewDisplaySize } from './utils';
import styles from './Post.module.scss';

const REDDIT_URL = 'https://www.reddit.com';

export const Post: FC<Props> = ({
  numComments,
  outdated,
  permalink,
  previewHeight,
  previewUrl,
  previewWidth,
  score,
  title,
  ...rest
}) => {
  const { height, width } = getPreviewDisplaySize(previewWidth, previewHeight);

  const clickHandler = (event: MouseEvent) => {
    if ((event.target as HTMLElement).nodeName !== 'BUTTON') {
      window.open(`${REDDIT_URL}${permalink}`);
    }
  };

  return (
    <div
      className={cn(styles.post, { [styles.outdated]: outdated })}
      onClick={clickHandler}
    >
      <aside className={styles.aside}>
        <span>{formatNumber(score)}</span>
      </aside>
      <main className={styles.main}>
        <PostDetails {...rest} />
        <h3 className={styles.title}>{title}</h3>
        {previewUrl && (
          <img alt="thumbnail" src={previewUrl} style={{ height, width }} />
        )}
        <div className={styles.footer}>
          <i className="far fa-comment" />
          <span className={styles.comments}>{formatNumber(numComments)}</span>
        </div>
      </main>
    </div>
  );
};

interface Props extends RedditPost {
  onSubredditClick: (subreddit: string) => void;
  outdated: boolean;
  showSubreddit: boolean;
}
