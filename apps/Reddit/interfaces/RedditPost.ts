export interface RedditPost {
  author: string;
  numComments: number;
  permalink: string;
  preview: Image | undefined;
  previewUrl?: string;
  previewWidth?: number;
  score: number;
  since: string;
  stickied: boolean;
  subreddit: string;
  title: string;
}

export interface Image {
  resolutions?: ImageResolution[];
  source: ImageResolution;
}

export interface ImageResolution {
  height: number;
  url: string;
  width: number;
}
