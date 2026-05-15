import { useLayoutEffect, useRef, useState } from 'preact/hooks';

import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';

import { Header } from './components/Header/Header';
import { Logo } from './components/Logo/Logo';
import { Menu } from './components/Menu/Menu';
import { Posts } from './components/Posts/Posts';
import { type RedditFilter } from './interfaces/RedditFilter';
import classes from './Reddit.module.css';

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
      className={classes.redditWindow}
      minHeight={600}
      minWidth={850}
      ref={windowRef}
      title="Reddit"
      titleClassName={classes.redditTitleBar}
      {...injectedWindowProps}
    >
      <div className={classes.reddit}>
        <aside className={classes.sidebar}>
          <Logo />
          <Menu activeSubreddit={subreddit} onClickSubreddit={goTo} />
        </aside>
        <main className={classes.body} ref={bodyRef}>
          <Header
            filter={filter}
            onClickFilter={setFilter}
            subreddit={subreddit}
          />
          <Posts
            filter={filter}
            onClickSubreddit={goTo}
            subreddit={subreddit}
          />
        </main>
      </div>
    </Window>
  );
};

export default Reddit;
