import { faReddit } from '@fortawesome/free-brands-svg-icons/faReddit';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { cancelable } from '@/platform/utils/cancelable';

import classes from './Icon.module.css';
import { getPreloadedIconSrc } from './utils/getPreloadedIconSrc';

export type IconProps = {
  active?: boolean;
  subreddit: string;
};

export const Icon: FunctionComponent<IconProps> = ({
  active = true,
  subreddit,
}) => {
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
    <figure className={classes.iconContainer}>
      {src ? (
        <img
          alt="icon"
          className={cn(classes.icon, { [classes.active]: active })}
          src={src}
        />
      ) : (
        <FontAwesomeIcon
          className={cn(classes.defaultIcon, {
            [classes.active]: active,
          })}
          icon={faReddit}
        />
      )}
    </figure>
  );
};
