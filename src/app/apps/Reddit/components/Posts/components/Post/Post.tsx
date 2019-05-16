import cn from 'classnames';
import React, { FC, MouseEvent } from 'react';
import { RedditPost } from '../../RedditPost';
import { PostDetails } from './PostDetails';
import {
  formatNumber,
  getPreviewDisplaySize,
  getPreviewResolution
} from './utils';
import styles from './Post.module.scss';

const REDDIT_URL = 'https://www.reddit.com';

export const Post: FC<Props> = ({
  numComments,
  outdated,
  permalink,
  preview,
  score,
  title,
  ...rest
}) => {
  const previewResolution = preview && getPreviewResolution(preview);

  const previewStyle =
    previewResolution && getPreviewDisplaySize(previewResolution);

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
        {previewResolution && (
          <img
            alt="thumbnail"
            className={styles.thumbnail}
            src={previewResolution.url}
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
  currentSubreddit: string;
  onClickSubreddit: (subreddit: string) => void;
  outdated: boolean;
}
