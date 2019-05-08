import React, { useEffect, useRef, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { FilterButton, Logo, Menu, Post, Spinner } from './components';
import { RedditFilter } from './interfaces';
import { getPosts } from './utils';
import styles from './Reddit.module.scss';

export const Reddit: WindowComponent = props => {
  const [currentFilter, setCurrentFilter] = useState<RedditFilter>();
  const [currentSubreddit, setCurrentSubreddit] = useState<string>();
  const [filter, setFilter] = useState<RedditFilter>('hot');
  const [posts, setPosts] = useState<any[]>([]);
  const [subreddit, setSubreddit] = useState('r/popular');
  const bodyRef = useRef<HTMLDivElement>(null);
  const loading = currentFilter !== filter || currentSubreddit !== subreddit;
  const showSubreddit = currentSubreddit !== 'popular';

  const goTo = async (subreddit: string, filter: RedditFilter = 'hot') => {
    setSubreddit(subreddit);
    setFilter(filter);
  };

  useEffect(() => {
    getPosts(subreddit, filter).then(posts => {
      setCurrentSubreddit(subreddit);
      setCurrentFilter(filter);
      setPosts(posts);

      if (bodyRef.current !== null) {
        bodyRef.current.scrollTop = 0;
      }
    });
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
        <div className={styles.sidebar}>
          <Logo />
          <Menu onSubredditClick={goTo} />
        </div>
        <div className={styles.body} ref={bodyRef}>
          {currentSubreddit && (
            <header className={styles.header}>
              <h1 className={styles.path}>
                {currentSubreddit}/{currentFilter}
              </h1>
              <FilterButton filter={filter} onClick={setFilter} />
            </header>
          )}
          {loading && <Spinner />}
          {posts.map(post => (
            <Post
              {...post}
              key={post.permalink}
              onSubredditClick={goTo}
              outdated={loading}
              showSubreddit={showSubreddit}
            />
          ))}
        </div>
      </div>
    </Window>
  );
};

Reddit.appName = 'Reddit';
Reddit.iconClass = 'fab fa-reddit-alien';
