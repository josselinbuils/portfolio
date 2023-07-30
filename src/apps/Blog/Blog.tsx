import cn from 'classnames';
import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { PROD_BASE_URL } from '@/platform/constants';
import styles from './Blog.module.scss';

const Blog: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => (
  <Window
    active={active}
    className={styles.blogWindow}
    minHeight={700}
    minWidth={830}
    ref={windowRef}
    title="Blog"
    titleClassName={styles.blogTitleBar}
    {...injectedWindowProps}
  >
    <iframe
      allow="fullscreen"
      className={cn(styles.iframe, { [styles.inactive]: !active })}
      height="100%"
      src={`${PROD_BASE_URL}/blog`}
      title="Blog"
      width="100%"
    />
  </Window>
);

export default Blog;
