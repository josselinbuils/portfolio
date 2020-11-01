import { FC } from 'react';
import { BlogPostMetadata } from '../../interfaces/BlogPostMetadata';
import { Markdown } from '../Markdown/Markdown';

import styles from './Posts.module.scss';

export const Posts: FC<Props> = ({ posts }) => (
  <Markdown className={styles.posts}>{`\
# Opinionated

Hey, I'm Josselin, a full-stack JavaScript developer 😄

Here are some posts where I give my opinion on code stuff 👨‍💻

## Posts

${posts.map(({ slug, title }) => `- [${title}](/blog/${slug})`).join('\\n')}
`}</Markdown>
);

interface Props {
  posts: BlogPostMetadata[];
}
