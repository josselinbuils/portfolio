import { FC } from 'react';
import { BlogPostMetadata } from '../../interfaces/BlogPostMetadata';
import { Markdown } from '../Markdown/Markdown';

import styles from './Posts.module.scss';

export const Posts: FC<Props> = ({ posts }) => (
  <Markdown className={styles.posts}>{`\
# Posts

${posts.map(({ slug, title }) => `- [${title}](/blog/${slug})`).join('\\n')}
`}</Markdown>
);

interface Props {
  posts: BlogPostMetadata[];
}
