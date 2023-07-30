import { faReddit } from '@fortawesome/free-brands-svg-icons/faReddit';
import cn from 'classnames';
import { type FC, useEffect, useState } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { cancelable } from '@/platform/utils/cancelable';
import styles from './Icon.module.scss';
import { getPreloadedIconSrc } from './utils/getPreloadedIconSrc';

export const Icon: FC<Props> = ({ active = true, subreddit }) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const [srcPromise, cancelSrcPromise] = cancelable(
      getPreloadedIconSrc(subreddit),
    );

    setSrc(undefined);
    srcPromise.then(setSrc);

    return cancelSrcPromise;
  }, [subreddit]);

  return (
    <figure className={styles.iconContainer}>
      {src ? (
        <img
          alt="icon"
          className={cn(styles.icon, { [styles.active]: active })}
          src={src}
        />
      ) : (
        <FontAwesomeIcon
          className={cn(styles.defaultIcon, {
            [styles.active]: active,
          })}
          icon={faReddit}
        />
      )}
    </figure>
  );
};

interface Props {
  active?: boolean;
  subreddit: string;
}
