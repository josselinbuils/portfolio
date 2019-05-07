import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { RedditPost } from '../RedditPost';
import { getIn } from './getIn';

dayjs.extend(relativeTime);

const PREVIEW_MAX_HEIGHT = 270;
const PREVIEW_MAX_WIDTH = 470;

export function formatPosts(posts: any[]): RedditPost[] {
  return posts.map(post => {
    const image = getMostSuitableResolution(post);

    const formattedPost: RedditPost = {
      author: `u/${post.author.name}`,
      numComments: post.num_comments,
      permalink: post.permalink,
      score: post.score,
      since: dayjs(post.created_utc * 1000).fromNow(),
      stickied: post.stickied,
      subreddit: post.subreddit_name_prefixed,
      title: post.title
    };

    if (image !== undefined) {
      formattedPost.previewHeight = image.height;
      formattedPost.previewUrl = image.url;
      formattedPost.previewWidth = image.width;
    }

    return formattedPost;
  });
}

function getMostSuitableResolution(post: any): ImageResolution | undefined {
  const image = getIn(post.preview, 'images[0]') as Image | undefined;

  if (image !== undefined) {
    const { resolutions = [], source } = image;

    const bestResolution = resolutions.find(({ height, width }) => {
      return height >= PREVIEW_MAX_HEIGHT || width >= PREVIEW_MAX_WIDTH;
    });

    return bestResolution || source;
  }
}

interface Image {
  resolutions?: ImageResolution[];
  source: ImageResolution;
}

interface ImageResolution {
  height: number;
  url: string;
  width: number;
}
