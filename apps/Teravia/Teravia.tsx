import cn from 'classnames';
import React from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { PROD_HOSTNAME } from '~/platform/constants';
import { TeraviaDescriptor } from './TeraviaDescriptor';

import styles from './Teravia.module.scss';

const Teravia: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => {
  return (
    <Window
      {...injectedWindowProps}
      active={active}
      background="#1a1d1e"
      keepContentRatio
      maxHeight={791}
      maxWidth={1367}
      minHeight={472}
      minWidth={800}
      ref={windowRef}
      title={TeraviaDescriptor.appName}
      titleColor="#2b5158"
    >
      <iframe
        allow="fullscreen"
        className={cn(styles.iframe, { [styles.inactive]: !active })}
        height="100%"
        src={`https://${PROD_HOSTNAME}/teravia`}
        title={TeraviaDescriptor.appName}
        width="100%"
      />
    </Window>
  );
};

export default Teravia;
