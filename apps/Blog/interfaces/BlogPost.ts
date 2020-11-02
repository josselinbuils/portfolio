import { BlogPostMetadata } from './BlogPostMetadata';

export interface BlogPost extends BlogPostMetadata {
  content: string;
  history: {
    commitHash: string;
    commitSubject: string;
    commitTimestamp: number;
  }[];
}
