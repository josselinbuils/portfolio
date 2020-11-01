import { BlogPostMetadata } from './BlogPostMetadata';

export interface BlogPost extends BlogPostMetadata {
  content: string;
  history: {
    commitDate: string;
    commitHash: string;
    commitSubject: string;
  }[];
}
