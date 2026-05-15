export type Image = {
  resolutions?: ImageResolution[];
  source: ImageResolution;
};

export type ImageResolution = {
  height: number;
  url: string;
  width: number;
};

export type RedditPost = {
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
};
