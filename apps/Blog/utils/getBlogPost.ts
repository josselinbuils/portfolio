import { BlogPost } from '../interfaces/BlogPost';
import { getPostSlug } from './getPostSlug';
import { getPostTitle } from './getPostTitle';

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
    const title = getPostTitle(content);

    cachedBlogPosts[slug] = { content, title, slug };
  }
  return cachedBlogPosts[slug];
}
