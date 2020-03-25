import {
  faGithub,
  faLinkedin,
  faTwitter
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Picture } from '~/platform/components';
import { Executor } from '../Executor';
import photoJPG from './josselinbuils.jpg';
import photoWEBP from './josselinbuils.webp';

import styles from './About.module.scss';

const socialLinks = [
  { icon: faLinkedin, url: 'https://linkedin.com/in/josselinbuils' },
  { icon: faGithub, url: 'https://github.com/josselinbuils' },
  { icon: faTwitter, url: 'https://twitter.com/josselinbuils' }
];

export const About: Executor = () => (
  <div className={styles.about}>
    <Picture
      alt="me"
      className={styles.photo}
      src={photoJPG}
      webpSrc={photoWEBP}
    />
    <div className={styles.info}>
      <p className={styles.resume}>
        Hey, I'm Josselin, a full-stack JavaScript developer :)
      </p>
      <p className={styles.social}>
        {socialLinks.map(({ icon, url }) => (
          <a href={url} key={url} rel="noopener noreferrer" target="_blank">
            <FontAwesomeIcon icon={icon} />
          </a>
        ))}
      </p>
      <p className={styles.help}>Type help for more information</p>
    </div>
  </div>
);
