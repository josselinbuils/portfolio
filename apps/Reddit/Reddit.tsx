import React, { useLayoutEffect, useRef, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { Header } from './components/Header';
import { Logo } from './components/Logo';
import { Menu } from './components/Menu';
import { Posts } from './components/Posts';
import { RedditFilter } from './interfaces/RedditFilter';
import { RedditDescriptor } from './RedditDescriptor';

import styles from './Reddit.module.scss';

const Reddit: WindowComponent = ({ windowRef, ...injectedWindowProps }) => {
  const [filter, setFilter] = useState<RedditFilter>('hot');
  const [subreddit, setSubreddit] = useState('r/popular');
  const bodyRef = useRef<HTMLDivElement>(null);

  const goTo = (newSubreddit: string, newFilter: RedditFilter = 'hot') => {
    setSubreddit(newSubreddit);
    setFilter(newFilter);
  };

  useLayoutEffect(() => {
    if (bodyRef.current !== null) {
      bodyRef.current.scrollTop = 0;
    }
  }, [filter, subreddit]);

  return (
    <Window
      {...injectedWindowProps}
      background="#fbfbfb"
      titleColor="#ff4501"
      minWidth={850}
      minHeight={600}
      ref={windowRef}
      title={RedditDescriptor.appName}
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
          <Posts
            onClickSubreddit={goTo}
            filter={filter}
            subreddit={subreddit}
          />
        </main>
      </div>
    </Window>
  );
};

export default Reddit;
