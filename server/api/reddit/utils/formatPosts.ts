import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getIn } from './getIn';

dayjs.extend(relativeTime);

export function formatPosts(posts: any[]) {
  return posts.map(post => ({
    author: `u/${post.author.name}`,
    numComments: post.num_comments,
    permalink: post.permalink,
    previewHeight: getIn(post.preview, 'images[0].source.height'),
    previewUrl: getIn(post.preview, 'images[0].source.url'),
    previewWidth: getIn(post.preview, 'images[0].source.width'),
    score: post.score,
    since: dayjs(post.created_utc * 1000).fromNow(),
    stickied: post.stickied,
    subreddit: post.subreddit_name_prefixed,
    title: post.title
  }));
}
