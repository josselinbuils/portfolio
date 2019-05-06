import React, { useEffect, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { Post } from './components';
import { getPosts } from './utils';
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
  const [path, setPath] = useState('r/popular/hot');
  const [currentPath, setCurrentPath] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const loading = currentPath !== path;
  const subreddit = (path.match(/(.*)\/[^/]+$/) || [])[1];
  const showSubreddit =
    path.indexOf('/r/') !== 0 || path.split('/')[2] === 'popular';

  const goTo = async (subreddit: string, type: 'hot' | 'top' = 'hot') => {
    setPath(`${subreddit}/${type}`);
  };

  useEffect(() => {
    getPosts(path).then(posts => {
      setCurrentPath(path);
      setPosts(posts);
    });
  }, [path]);

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
                className={styles.buttonLink}
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
                      className={styles.buttonLink}
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
        <div className={styles.body}>
          <h1 className={styles.path}>
            {currentPath}
            {subreddit && (
              <span>
                {currentPath.slice(-4) !== '/hot' && (
                  <button
                    className={styles.buttonLink}
                    onClick={() => goTo(subreddit)}
                  >
                    Hot
                  </button>
                )}
                {currentPath.slice(-4) !== '/top' && (
                  <button
                    className={styles.buttonLink}
                    onClick={() => goTo(subreddit, 'top')}
                  >
                    Top
                  </button>
                )}
              </span>
            )}
          </h1>
          {loading && (
            <div className={styles.spinner}>
              <div className={styles.doubleBounce1} />
              <div className={styles.doubleBounce2} />
            </div>
          )}
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
