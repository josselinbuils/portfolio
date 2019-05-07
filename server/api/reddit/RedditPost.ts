export interface RedditPost {
  author: string;
  numComments: number;
  permalink: string;
  previewHeight?: number;
  previewUrl?: string;
  previewWidth?: number;
  score: number;
  since: string;
  stickied: boolean;
  subreddit: string;
  title: string;
}
