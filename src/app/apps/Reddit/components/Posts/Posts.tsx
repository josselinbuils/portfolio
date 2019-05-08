import React, { FC } from 'react';
import { RedditPost } from '../../interfaces';
import { Post } from './Post';

export const Posts: FC<Props> = ({
  currentSubreddit,
  onClickSubreddit,
  posts,
  outdated
}) => (
  <>
    {posts.map(post => (
      <Post
        {...post}
        currentSubreddit={currentSubreddit}
        key={post.permalink}
        onClickSubreddit={onClickSubreddit}
        outdated={outdated}
      />
    ))}
  </>
);

interface Props {
  currentSubreddit: string;
  onClickSubreddit: (subreddit: string) => void;
  posts: RedditPost[];
  outdated: boolean;
}
