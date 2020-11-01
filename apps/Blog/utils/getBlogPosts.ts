import { BlogPostMetadata } from '../interfaces/BlogPostMetadata';
import { getPostDescription } from './getPostDescription';
import { getPostSlug } from './getPostSlug';
import { getPostTitle } from './getPostTitle';

let cachedBlogPosts: BlogPostMetadata[];

export function getBlogPosts(): BlogPostMetadata[] {
  if (cachedBlogPosts === undefined || process.env.NODE_ENV !== 'production') {
    const context = require.context('../posts', false, /\.md$/);

    cachedBlogPosts = context.keys().map((key) => {
      const content = context(key).default as string;

      return {
        description: getPostDescription(content),
        slug: getPostSlug(key),
        title: getPostTitle(content),
      };
    });
  }
  return cachedBlogPosts;
}
