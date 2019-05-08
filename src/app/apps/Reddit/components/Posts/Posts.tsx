import React, { FC, useEffect, useRef, useState } from 'react';
import { RedditFilter } from '../../interfaces';
import { Post, Spinner } from './components';
import { RedditPost } from './RedditPost';
import { getPosts } from './utils';

export const Posts: FC<Props> = ({ filter, onClickSubreddit, subreddit }) => {
  const [currentSubreddit, setCurrentSubreddit] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<RedditPost[]>([]);

  const loadingPromiseRef = useRef<Promise<any>>(Promise.resolve());

  useEffect(() => {
    setLoading(true);

    const promise = getPosts(subreddit, filter)
      .then(({ posts, subreddit }) => {
        if (loadingPromiseRef.current === promise) {
          setCurrentSubreddit(subreddit);
          setPosts(posts);
        }
      })
      .finally(() => {
        if (loadingPromiseRef.current === promise) {
          setLoading(false);
        }
      });

    loadingPromiseRef.current = promise;
  }, [filter, subreddit]);

  return (
    <>
      {loading && <Spinner />}
      {currentSubreddit &&
        posts.map(post => (
          <Post
            {...post}
            currentSubreddit={currentSubreddit}
            key={post.permalink}
            onClickSubreddit={onClickSubreddit}
            outdated={loading}
          />
        ))}
    </>
  );
};

interface Props {
  filter: RedditFilter;
  onClickSubreddit: (subreddit: string) => void;
  subreddit: string;
}
