import { faAnchor } from '@fortawesome/free-solid-svg-icons/faAnchor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { ButtonLink } from '~/platform/components/ButtonLink';
import { Icon } from '../../Icon';

import styles from './PostDetails.module.scss';

export const PostDetails: FC<Props> = ({
  author,
  currentSubreddit,
  onClickSubreddit,
  since,
  stickied,
  subreddit,
}) => (
  <div className={styles.details}>
    {currentSubreddit === 'r/popular' && (
      <ButtonLink
        className={styles.subreddit}
        onClick={() => onClickSubreddit(subreddit)}
      >
        <Icon subreddit={subreddit} />
        <span>{subreddit}</span>
      </ButtonLink>
    )}
    <span>
      Posted <time>{since}</time> by {author}
    </span>
    {stickied && <FontAwesomeIcon className={styles.anchor} icon={faAnchor} />}
  </div>
);

interface Props {
  author: string;
  currentSubreddit: string;
  since: string;
  stickied: boolean;
  subreddit: string;
  onClickSubreddit(subreddit: string): void;
}
