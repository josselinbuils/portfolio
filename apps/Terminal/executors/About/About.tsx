import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons/faLinkedin';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';
import { faAddressCard } from '@fortawesome/free-solid-svg-icons/faAddressCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import type { Executor } from '../Executor';
import styles from './About.module.scss';
import me from './me.png';

export const About: Executor = () => (
  <div className={styles.about}>
    <Image alt="me" height={269} priority src={me} width={202} />
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
        <a aria-label="Curriculum Vitae" href="/assets/cv.pdf" target="_blank">
          <FontAwesomeIcon icon={faAddressCard} />
        </a>
      </p>
      <p className={styles.help}>Type help for more information</p>
    </div>
  </div>
);
