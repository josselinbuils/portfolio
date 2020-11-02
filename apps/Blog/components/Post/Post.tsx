import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FC } from 'react';
import { BlogPost } from '~/apps/Blog/interfaces/BlogPost';
import { Markdown } from '../Markdown/Markdown';

import styles from './Post.module.scss';

dayjs.extend(relativeTime);

export const Post: FC<Props> = ({ post }) => (
  <Markdown className={styles.post} tag="article">{`\
[🔙](/blog)

${post.content}

## History

${post.history
  .map(({ commitHash, commitSubject, commitTimestamp }) => {
    const date = dayjs(commitTimestamp).fromNow();
    return `- [${commitSubject}](https://github.com/josselinbuils/portfolio/commit/${commitHash}) committed ${date}.`;
  })
  .join('\n')}
`}</Markdown>
);

interface Props {
  post: BlogPost;
}
