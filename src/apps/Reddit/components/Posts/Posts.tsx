import { type FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { Spinner } from '@/platform/components/Spinner/Spinner';

import { type RedditFilter } from '../../interfaces/RedditFilter';
import { type RedditPost } from '../../interfaces/RedditPost';
import { getPosts } from './getPosts';
import { Post } from './Post/Post';

export type PostsProps = {
  filter: RedditFilter;
  onClickSubreddit(subreddit: string): void;
  subreddit: string;
};

export const Posts: FunctionComponent<PostsProps> = ({
  filter,
  onClickSubreddit,
  subreddit,
}) => {
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
