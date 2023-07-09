import cn from 'classnames';
import { Window } from '~/platform/components/Window/Window';
import { type WindowComponent } from '~/platform/components/Window/WindowComponent';
import styles from './Blog.module.scss';

const Blog: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => (
  <Window
    active={active}
    background="#fbfbfb"
    minHeight={700}
    minWidth={830}
    ref={windowRef}
    title="Blog"
    titleColor="black"
    {...injectedWindowProps}
  >
    <iframe
      allow="fullscreen"
      className={cn(styles.iframe, { [styles.inactive]: !active })}
      height="100%"
      src="/blog"
      title="Blog"
      width="100%"
    />
  </Window>
);

export default Blog;
