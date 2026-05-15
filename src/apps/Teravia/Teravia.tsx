import cn from 'classnames';

import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { PROD_BASE_URL } from '@/platform/constants';

import classes from './Teravia.module.css';

const Teravia: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => (
  <Window
    active={active}
    className={classes.teraviaWindow}
    keepContentRatio
    maxHeight={791}
    maxWidth={1367}
    minHeight={472}
    minWidth={800}
    ref={windowRef}
    title="Teravia"
    titleClassName={classes.teraviaTitleBar}
    {...injectedWindowProps}
  >
    <iframe
      allow="fullscreen"
      className={cn(classes.iframe, { [classes.inactive]: !active })}
      height="100%"
      src={`${PROD_BASE_URL}/teravia`}
      title="Teravia"
      width="100%"
    />
  </Window>
);

export default Teravia;
