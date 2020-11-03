import { FC } from 'react';
import { BlogPostMetadata } from '../../interfaces/BlogPostMetadata';
import { Markdown } from '../Markdown/Markdown';

import styles from './Posts.module.scss';

export const Posts: FC<Props> = ({ posts }) => (
  <Markdown className={styles.posts}>{`\
# Opinionated

Hey, I'm Josselin, a full-stack JavaScript developer 😄

Here are some posts where I give my opinion on code stuff 👨‍💻

[![{ "alt": "LinkedIn", "height": 40, "loading": "eager", "width": 40 }](/blog/linkedin.svg)](https://www.linkedin.com/in/josselinbuils)
[![{ "alt": "Twitter", "height": 40, "loading": "eager", "style": { "marginLeft": "2rem" }, "width": 40 }](/blog/twitter.svg)](https://twitter.com/josselinbuils)
[![{ "alt": "Twitter", "height": 40, "loading": "eager", "style": { "marginLeft": "2rem" }, "width": 40 }](/blog/github.svg)](https://github.com/josselinbuils)

## Posts

${posts.map(({ slug, title }) => `- [${title}](/blog/${slug})`).join('\\n')}
`}</Markdown>
);

interface Props {
  posts: BlogPostMetadata[];
}
