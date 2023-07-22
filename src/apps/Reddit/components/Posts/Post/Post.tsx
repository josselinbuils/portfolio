import { faComment } from '@fortawesome/free-regular-svg-icons/faComment';
import cn from 'classnames';
import { type FC } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { type RedditPost } from '../../../interfaces/RedditPost';
import styles from './Post.module.scss';
import { PostDetails } from './PostDetails';
import { formatNumber } from './utils/formatNumber';
import { getPreviewDisplaySize } from './utils/getPreviewDisplaySize';
import { getPreviewResolution } from './utils/getPreviewResolution';

const REDDIT_URL = 'https://www.reddit.com';

export interface PostProps extends RedditPost {
  currentSubreddit: string;
  outdated: boolean;
  onClickSubreddit(subreddit: string): void;
}

export const Post: FC<PostProps> = ({
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
    if ((event.currentTarget as HTMLElement).nodeName !== 'BUTTON') {
      window.open(`${REDDIT_URL}${permalink}`);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className={cn(styles.post, { [styles.outdated]: outdated })}
      onClick={clickHandler}
      role="button"
      tabIndex={0}
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
            loading="lazy"
            src={previewResolution.url}
            style={previewStyle}
          />
        )}
        <div className={styles.footer}>
          <FontAwesomeIcon icon={faComment} />
          <span className={styles.comments}>{formatNumber(numComments)}</span>
        </div>
      </main>
    </div>
  );
};
