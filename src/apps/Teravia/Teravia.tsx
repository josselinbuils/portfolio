import cn from 'classnames';
import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { PROD_BASE_URL } from '@/platform/constants';
import styles from './Teravia.module.scss';

const Teravia: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => (
  <Window
    active={active}
    className={styles.teraviaWindow}
    keepContentRatio
    maxHeight={791}
    maxWidth={1367}
    minHeight={472}
    minWidth={800}
    ref={windowRef}
    title="Teravia"
    titleClassName={styles.teraviaTitleBar}
    {...injectedWindowProps}
  >
    <iframe
      allow="fullscreen"
      className={cn(styles.iframe, { [styles.inactive]: !active })}
      height="100%"
      src={`${PROD_BASE_URL}/teravia`}
      title="Teravia"
      width="100%"
    />
  </Window>
);

export default Teravia;
