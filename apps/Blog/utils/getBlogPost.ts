import { BlogPost } from '../interfaces/BlogPost';
import { getPostDescription } from './getPostDescription';
import { getPostSlug } from './getPostSlug';
import { getPostTitle } from './getPostTitle';
import { getPostHistory } from '~/apps/Blog/utils/getPostHistory';

const cachedBlogPosts = {} as { [slug: string]: BlogPost };

export function getBlogPost(slug: string): BlogPost {
  if (
    cachedBlogPosts[slug] === undefined ||
    process.env.NODE_ENV !== 'production'
  ) {
    const context = require.context('../posts', false, /\.md$/);
    const postKey = context.keys().find((key) => getPostSlug(key) === slug);

    if (postKey === undefined) {
      throw new Error(`Unable to find post with slug ${slug}.`);
    }
    const content = context(postKey).default as string;
    const description = getPostDescription(content);
    const history = getPostHistory(postKey);
    const title = getPostTitle(content);

    cachedBlogPosts[slug] = { content, description, history, title, slug };
  }
  return cachedBlogPosts[slug];
}
