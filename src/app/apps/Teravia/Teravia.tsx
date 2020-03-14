import cn from 'classnames';
import React from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import styles from './Teravia.module.scss';
import { TeraviaDescriptor } from './TeraviaDescriptor';

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
      keepContentRatio={true}
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
        src="https://josselinbuils.me/teravia"
        title={TeraviaDescriptor.appName}
        width="100%"
      />
    </Window>
  );
};

Teravia.appDescriptor = TeraviaDescriptor;

export default Teravia;
