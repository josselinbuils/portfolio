import { BlogPostMetadata } from './BlogPostMetadata';

export interface BlogPost extends BlogPostMetadata {
  content: string;
}
