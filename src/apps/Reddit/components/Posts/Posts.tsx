import React, { FC, useEffect, useRef, useState } from 'react';
import { Spinner } from '~/platform/components';
import { RedditFilter } from '../../interfaces/RedditFilter';
import { getPosts } from './getPosts';
import { Post } from './Post';
import { RedditPost } from './RedditPost';

export const Posts: FC<Props> = ({ filter, onClickSubreddit, subreddit }) => {
  const [currentSubreddit, setCurrentSubreddit] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<RedditPost[]>([]);

  const loadingPromiseRef = useRef<Promise<any>>(Promise.resolve());

  useEffect(() => {
    setLoading(true);

    const promise = getPosts(subreddit, filter)
      .then((result) => {
        if (loadingPromiseRef.current === promise) {
          setCurrentSubreddit(result.subreddit);
          setPosts(result.posts);
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
      {loading && <Spinner color="#ff4501" />}
      {currentSubreddit &&
        posts.map((post) => (
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
  subreddit: string;
  onClickSubreddit(subreddit: string): void;
}
