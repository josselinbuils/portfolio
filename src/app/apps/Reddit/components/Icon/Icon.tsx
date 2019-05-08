import cn from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { getIconSrc } from './utils';
import styles from './Icon.module.scss';

export const Icon: FC<Props> = ({ active = true, size, subreddit }) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    setSrc(undefined);
    getIconSrc(subreddit).then(setSrc);
  }, [subreddit]);

  return src ? (
    <img
      alt="icon"
      className={cn(styles.icon, { [styles.active]: active })}
      src={src}
      style={{ borderRadius: size / 2, height: size }}
    />
  ) : (
    <i
      className={cn('fab fa-reddit', styles.defaultIcon, {
        [styles.active]: active
      })}
      style={{ fontSize: size }}
    />
  );
};

interface Props {
  active?: boolean;
  size: number;
  subreddit: string;
}
