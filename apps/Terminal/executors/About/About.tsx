import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons/faLinkedin';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Image } from '~/platform/components/Image/Image';
import { Executor } from '../Executor';

import styles from './About.module.scss';

export const About: Executor = () => (
  <div className={styles.about}>
    <Image
      alt="me"
      fallbackSrc="/me-1x.jpg"
      height={269}
      loading="eager"
      srcSet="/me-1x.webp, /me-2x.webp 2x"
      width={202}
    />
    <div className={styles.info}>
      <p className={styles.resume}>
        Hey, I&apos;m Josselin, a full-stack JavaScript developer :)
      </p>
      <p className={styles.social}>
        <a
          aria-label="LinkedIn account"
          href="https://linkedin.com/in/josselinbuils"
          rel="noopener noreferrer"
          target="_blank"
        >
          <FontAwesomeIcon icon={faLinkedin} />
        </a>
        <a
          aria-label="GitHub account"
          href="https://github.com/josselinbuils"
          rel="noopener noreferrer"
          target="_blank"
        >
          <FontAwesomeIcon icon={faGithub} />
        </a>
        <a
          aria-label="Twitter account"
          href="https://twitter.com/josselinbuils"
          rel="noopener noreferrer"
          target="_blank"
        >
          <FontAwesomeIcon icon={faTwitter} />
        </a>
      </p>
      <p className={styles.help}>Type help for more information</p>
    </div>
  </div>
);
