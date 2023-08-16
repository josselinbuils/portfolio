import { faAnchor } from '@fortawesome/free-solid-svg-icons/faAnchor';
import { type FC } from 'preact/compat';
import { ButtonLink } from '@/platform/components/ButtonLink/ButtonLink';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { Icon } from '../../Icon/Icon';
import styles from './PostDetails.module.scss';

export interface PostDetailsProps {
  author: string;
  currentSubreddit: string;
  since: string;
  stickied: boolean;
  subreddit: string;
  onClickSubreddit(subreddit: string): void;
}

export const PostDetails: FC<PostDetailsProps> = ({
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
