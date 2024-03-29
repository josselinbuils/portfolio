import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { type RedditPost } from '../../interfaces/RedditPost';

dayjs.extend(relativeTime);

export function formatPosts(posts: any[]): RedditPost[] {
  return posts.map(
    (post) =>
      ({
        author: `u/${post.author.name}`,
        numComments: post.num_comments,
        preview: post.preview?.images[0],
        permalink: post.permalink,
        score: post.score,
        since: dayjs(post.created_utc * 1000).fromNow(),
        stickied: post.stickied,
        subreddit: post.subreddit_name_prefixed,
        title: post.title,
      }) as RedditPost,
  );
}
