import { useLayoutEffect, useRef, useState } from 'react';
import { Window } from '~/platform/components/Window/Window';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';
import { Header } from './components/Header/Header';
import { Logo } from './components/Logo/Logo';
import { Menu } from './components/Menu/Menu';
import { Posts } from './components/Posts/Posts';
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
      background="#fbfbfb"
      minHeight={600}
      minWidth={850}
      ref={windowRef}
      title={RedditDescriptor.appName}
      titleColor="#ff4501"
      {...injectedWindowProps}
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
