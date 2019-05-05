import cn from 'classnames';
import React, { useEffect, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import styles from './Reddit.module.scss';
import { getPosts } from '~/apps/Reddit/utils';

const subreddits = [
  'angularjs',
  'CrappyDesign',
  'docker',
  'javascript',
  'node',
  'ProgrammerHumor',
  'todayilearned'
];

// TODO create interface for posts

export const Reddit: WindowComponent = props => {
  const [path, setPath] = useState('/r/popular/hot');
  const [posts, setPosts] = useState<any[]>([]);
  const subreddit = path.indexOf('/r/') === 0 ? path.split('/')[2] : '';
  const showSubreddit =
    path.indexOf('/r/') !== 0 || path.split('/')[2] === 'popular';

  useEffect(() => {
    setPosts([]);
    getPosts(path).then(setPosts);
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
                onClick={() => setPath('/r/popular/hot')}
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
                      onClick={() => setPath(`/r/${subreddit}/hot`)}
                    >
                      r/{subreddit}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
        <div className={styles.body}>
          <h1 className={styles.path}>
            {path}
            {subreddit && (
              <span>
                {path.slice(-4) !== '/hot' && (
                  <button
                    className={styles.buttonLink}
                    onClick={() => setPath(`/r/${subreddit}/hot`)}
                  >
                    Hot
                  </button>
                )}
                {path.slice(-4) !== '/top' && (
                  <button
                    className={styles.buttonLink}
                    onClick={() => setPath(`/r/${subreddit}/top`)}
                  >
                    Top
                  </button>
                )}
              </span>
            )}
          </h1>
          {posts.length === 0 && (
            <div className={styles.spinner}>
              <div className={styles.doubleBounce1} />
              <div className={styles.doubleBounce2} />
            </div>
          )}
          <div className={styles.posts}>
            {posts.map(
              ({
                author,
                domain,
                numComments,
                permalink,
                previewUrl,
                score,
                since,
                stickied,
                title,
                url
              }) => (
                <div
                  className={cn(styles.post, {
                    [styles.hasPreview]: previewUrl,
                    [styles.stickied]: stickied
                  })}
                  key={permalink}
                >
                  <div className={styles.postScore}>
                    <span>{score}</span>
                  </div>
                  {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
                  <a
                    className={styles.postThumbnail}
                    href={url}
                    rel="noopener noreferrer"
                    style={{ backgroundImage: `url(${previewUrl})` }}
                    target="_blank"
                  />
                  <div className={styles.postInfo}>
                    <a
                      className={styles.postTitle}
                      href={url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {title}
                    </a>
                    <div className={styles.postDetails}>
                      <div>
                        <span>
                          submitted {since} by u/{author}
                        </span>
                        {showSubreddit && (
                          <span>
                            on{' '}
                            <button
                              className={styles.buttonLink}
                              onClick={() => setPath(`/r/${subreddit}/hot`)}
                            >
                              r/{subreddit}
                            </button>
                          </span>
                        )}
                        <span className={styles.domain}>{domain}</span>
                      </div>
                      <div>
                        <a
                          href={`https://www.reddit.com${permalink}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <i className="far fa-comments" />
                          <span className={styles.comments}>{numComments}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Window>
  );
};

Reddit.appName = 'Reddit';
Reddit.iconClass = 'fab fa-reddit-alien';
