import { faComment } from '@fortawesome/free-regular-svg-icons/faComment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC, MouseEvent } from 'react';
import { RedditPost } from '../RedditPost';
import { PostDetails } from './PostDetails';
import { formatNumber } from './utils/formatNumber';
import { getPreviewDisplaySize } from './utils/getPreviewDisplaySize';
import { getPreviewResolution } from './utils/getPreviewResolution';

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
  let previewStyle;

  if (previewResolution) {
    const { height, width } = getPreviewDisplaySize(previewResolution);

    previewStyle = {
      height: `${height / 10}rem`,
      width: `${width / 10}rem`,
    };
  }

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
          <FontAwesomeIcon icon={faComment} />
          <span className={styles.comments}>{formatNumber(numComments)}</span>
        </div>
      </main>
    </article>
  );
};

interface Props extends RedditPost {
  currentSubreddit: string;
  outdated: boolean;
  onClickSubreddit(subreddit: string): void;
}
