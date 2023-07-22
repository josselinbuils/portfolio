import { faHeadphones } from '@fortawesome/free-solid-svg-icons/faHeadphones';
import { type FC } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import styles from './Logo.module.scss';

export const Logo: FC = () => (
  <figure className={styles.logo}>
    <FontAwesomeIcon icon={faHeadphones} />
  </figure>
);
