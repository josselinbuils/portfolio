import React, { useEffect, useRef, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { Header, Logo, Menu, Posts, Spinner } from './components';
import { RedditFilter, RedditPostMap } from './interfaces';
import { getPosts } from './utils';
import styles from './Reddit.module.scss';

export const Reddit: WindowComponent = props => {
  const [filter, setFilter] = useState<RedditFilter>('hot');
  const [loading, setLoading] = useState(false);
  const [postMap, setPostMap] = useState<RedditPostMap>();
  const [subreddit, setSubreddit] = useState('r/popular');

  const bodyRef = useRef<HTMLDivElement>(null);
  const loadingPromiseRef = useRef<Promise<any>>(Promise.resolve());

  const goTo = async (subreddit: string, filter: RedditFilter = 'hot') => {
    setSubreddit(subreddit);
    setFilter(filter);
  };

  useEffect(() => {
    setLoading(true);

    const promise = getPosts(subreddit, filter)
      .then(postMap => {
        if (loadingPromiseRef.current === promise) {
          setPostMap(postMap);

          if (bodyRef.current !== null) {
            bodyRef.current.scrollTop = 0;
          }
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
    <Window
      {...props}
      background="#fbfbfb"
      titleColor="#ff4501"
      minWidth={850}
      minHeight={500}
      title={Reddit.appName}
    >
      <div className={styles.reddit}>
        <aside className={styles.sidebar}>
          <Logo />
          <Menu activeSubreddit={subreddit} onClickSubreddit={goTo} />
        </aside>
        <main className={styles.body} ref={bodyRef}>
          <Header
            filter={filter}
            onClickFilter={setFilter}
            subreddit={subreddit}
          />
          {loading && <Spinner />}
          {postMap && (
            <Posts
              currentSubreddit={postMap.subreddit}
              onClickSubreddit={goTo}
              outdated={loading}
              posts={postMap.posts}
            />
          )}
        </main>
      </div>
    </Window>
  );
};

Reddit.appName = 'Reddit';
Reddit.iconClass = 'fab fa-reddit-alien';
