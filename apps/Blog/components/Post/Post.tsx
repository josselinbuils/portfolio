import { FC } from 'react';
import { BlogPost } from '~/apps/Blog/interfaces/BlogPost';
import { Markdown } from '../Markdown/Markdown';

import styles from './Post.module.scss';

export const Post: FC<Props> = ({ post }) => (
  <Markdown className={styles.post} tag="article">{`\
[🔙](/blog)

${post.content}

## History

${post.history
  .map(
    ({ commitDate, commitHash, commitSubject }) =>
      `- ${commitDate}: [${commitSubject}](https://github.com/josselinbuils/portfolio/commit/${commitHash})`
  )
  .join('\n')}
`}</Markdown>
);

interface Props {
  post: BlogPost;
}
