import cn from 'classnames';

import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { PROD_BASE_URL } from '@/platform/constants';

import classes from './Blog.module.css';

const Blog: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => (
  <Window
    active={active}
    className={classes.blogWindow}
    minHeight={700}
    minWidth={830}
    ref={windowRef}
    title="Blog"
    titleClassName={classes.blogTitleBar}
    {...injectedWindowProps}
  >
    <iframe
      allow="fullscreen"
      className={cn(classes.iframe, { [classes.inactive]: !active })}
      height="100%"
      src={`${PROD_BASE_URL}/blog`}
      title="Blog"
      width="100%"
    />
  </Window>
);

export default Blog;
