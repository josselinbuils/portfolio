import cn from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { cancelable } from '~/platform/utils';
import { getIconSrc } from './utils';
import styles from './Icon.module.scss';

export const Icon: FC<Props> = ({ active = true, subreddit }) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const [srcPromise, cancelSrcPromise] = cancelable(getIconSrc(subreddit));

    setSrc(undefined);
    srcPromise.then(setSrc);

    return cancelSrcPromise;
  }, [subreddit]);

  return src ? (
    <img
      alt="icon"
      className={cn(styles.icon, { [styles.active]: active })}
      src={src}
    />
  ) : (
    <i
      className={cn('fab fa-reddit', styles.defaultIcon, {
        [styles.active]: active
      })}
    />
  );
};

interface Props {
  active?: boolean;
  subreddit: string;
}
