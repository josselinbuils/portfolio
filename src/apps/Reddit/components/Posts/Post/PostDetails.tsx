import { faAnchor } from '@fortawesome/free-solid-svg-icons/faAnchor';
import { type FunctionComponent } from 'preact';

import { ButtonLink } from '@/platform/components/ButtonLink/ButtonLink';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import { Icon } from '../../Icon/Icon';
import styles from './PostDetails.module.css';

export type PostDetailsProps = {
  author: string;
  currentSubreddit: string;
  onClickSubreddit(subreddit: string): void;
  since: string;
  stickied: boolean;
  subreddit: string;
};

export const PostDetails: FunctionComponent<PostDetailsProps> = ({
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
