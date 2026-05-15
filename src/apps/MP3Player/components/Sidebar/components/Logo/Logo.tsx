import { faHeadphones } from '@fortawesome/free-solid-svg-icons/faHeadphones';
import { type FunctionComponent } from 'preact';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import classes from './Logo.module.css';

export const Logo: FunctionComponent = () => (
  <figure className={classes.logo}>
    <FontAwesomeIcon icon={faHeadphones} />
  </figure>
);
