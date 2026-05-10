import { faHeadphones } from '@fortawesome/free-solid-svg-icons/faHeadphones';
import { type FunctionComponent } from 'preact';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import styles from './Logo.module.scss';

export const Logo: FunctionComponent = () => (
  <figure className={styles.logo}>
    <FontAwesomeIcon icon={faHeadphones} />
  </figure>
);
