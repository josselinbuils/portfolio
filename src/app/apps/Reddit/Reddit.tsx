import React, { useEffect, useRef, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { FilterButton, Post, Spinner } from './components';
import { RedditFilter } from './interfaces';
import { getPosts } from './utils';
import commonStyles from './common.module.scss';
import styles from './Reddit.module.scss';

const subreddits = [
  'r/Angular2',
  'r/CrappyDesign',
  'r/docker',
  'r/javascript',
  'r/node',
  'r/ProgrammerHumor',
  'r/reactjs',
  'r/todayilearned'
];

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
          <div className={styles.logo}>
            <i className="fab fa-reddit-alien" />
          </div>
          <ul className={styles.menu}>
            <li>
              <button
                className={commonStyles.buttonLink}
                onClick={() => goTo('r/popular')}
              >
                Popular
              </button>
            </li>
            <li>
              Subreddits
              <ul>
                {subreddits.map(subreddit => (
                  <li key={subreddit}>
                    <button
                      className={commonStyles.buttonLink}
                      onClick={() => goTo(subreddit)}
                    >
                      {subreddit}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
        <div className={styles.body} ref={bodyRef}>
          {currentSubreddit && (
            <div className={styles.header}>
              <h1 className={styles.path}>
                {currentSubreddit}/{currentFilter}
              </h1>
              <FilterButton filter={filter} onClick={setFilter} />
            </div>
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
