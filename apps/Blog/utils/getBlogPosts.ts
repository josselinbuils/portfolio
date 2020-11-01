import { BlogPostMetadata } from '../interfaces/BlogPostMetadata';
import { getPostSlug } from './getPostSlug';
import { getPostTitle } from './getPostTitle';

export function getBlogPosts(): BlogPostMetadata[] {
  const context = require.context('../posts', false, /\.md$/);

  return context.keys().map((key) => ({
    slug: getPostSlug(key),
    title: getPostTitle(context(key).default),
  }));
}
