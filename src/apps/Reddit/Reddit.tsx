import { useLayoutEffect, useRef, useState } from 'preact/compat';
import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import styles from './Reddit.module.scss';
import { Header } from './components/Header/Header';
import { Logo } from './components/Logo/Logo';
import { Menu } from './components/Menu/Menu';
import { Posts } from './components/Posts/Posts';
import { type RedditFilter } from './interfaces/RedditFilter';

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
      className={styles.redditWindow}
      minHeight={600}
      minWidth={850}
      ref={windowRef}
      title="Reddit"
      titleClassName={styles.redditTitleBar}
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
