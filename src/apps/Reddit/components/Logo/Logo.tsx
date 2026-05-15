import { faRedditAlien } from '@fortawesome/free-brands-svg-icons/faRedditAlien';
import { type FunctionComponent } from 'preact';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import classes from './Logo.module.css';

export const Logo: FunctionComponent = () => (
  <figure className={classes.logo}>
    <FontAwesomeIcon className={classes.icon} icon={faRedditAlien} />
  </figure>
);
