import React from 'react';
import { Picture } from '~/platform/components';
import { Executor } from '../Executor';
import styles from './About.module.scss';
import photoJPG from './josselinbuils.jpg';
import photoWEBP from './josselinbuils.webp';

const socialLinks = [
  ['linkedin', 'https://linkedin.com/in/josselinbuils'],
  ['github', 'https://github.com/josselinbuils'],
  ['twitter', 'https://twitter.com/josselinbuils']
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
        {socialLinks.map(([icon, link]) => (
          <a href={link} key={icon} rel="noopener noreferrer" target="_blank">
            <i className={`fab fa-${icon}`} />
          </a>
        ))}
      </p>
      <p className={styles.help}>Type help for more information</p>
    </div>
  </div>
);
