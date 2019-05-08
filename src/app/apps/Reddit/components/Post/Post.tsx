import cn from 'classnames';
import React, { FC, MouseEvent } from 'react';
import { RedditPost } from '../../interfaces';
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
  const previewStyle =
    previewUrl !== undefined
      ? getPreviewDisplaySize(previewWidth as number, previewHeight as number)
      : undefined;

  const clickHandler = (event: MouseEvent) => {
    if ((event.target as HTMLElement).nodeName !== 'BUTTON') {
      window.open(`${REDDIT_URL}${permalink}`);
    }
  };

  return (
    <article
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
          <img
            alt="thumbnail"
            className={styles.thumbnail}
            src={previewUrl}
            style={previewStyle}
          />
        )}
        <div className={styles.footer}>
          <i className="far fa-comment" />
          <span className={styles.comments}>{formatNumber(numComments)}</span>
        </div>
      </main>
    </article>
  );
};

interface Props extends RedditPost {
  onSubredditClick: (subreddit: string) => void;
  outdated: boolean;
  showSubreddit: boolean;
}
