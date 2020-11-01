import cn from 'classnames';
import { Window } from '~/platform/components/Window/Window';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';
import { BlogDescriptor } from './BlogDescriptor';

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
    minWidth={800}
    ref={windowRef}
    title={BlogDescriptor.appName}
    titleColor="black"
    {...injectedWindowProps}
  >
    <iframe
      allow="fullscreen"
      className={cn(styles.iframe, { [styles.inactive]: !active })}
      height="100%"
      src="/blog"
      title={BlogDescriptor.appName}
      width="100%"
    />
  </Window>
);

export default Blog;
