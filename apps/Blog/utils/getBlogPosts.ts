import { BlogPostMetadata } from '../interfaces/BlogPostMetadata';
import { getPostSlug } from './getPostSlug';
import { getPostTitle } from './getPostTitle';

let cachedBlogPosts: BlogPostMetadata[];

export function getBlogPosts(): BlogPostMetadata[] {
  if (cachedBlogPosts === undefined || process.env.NODE_ENV !== 'production') {
    const context = require.context('../posts', false, /\.md$/);

    cachedBlogPosts = context.keys().map((key) => ({
      slug: getPostSlug(key),
      title: getPostTitle(context(key).default),
    }));
  }
  return cachedBlogPosts;
}
