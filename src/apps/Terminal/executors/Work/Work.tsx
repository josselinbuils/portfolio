import React from 'react';
import { Executor } from '../Executor';

import styles from './Work.module.scss';

export const Work: Executor = () => (
  <>
    <div className={styles.entry}>
      <p className={styles.header}>
        <span>Software Engineer at General Electric Healthcare</span>
        <span className={styles.location}>(Buc, France)</span>
        <span className={styles.period}>oct 2015 -> nov 2018</span>
      </p>
      <p className={styles.description}>
        I worked on the frontend part of an SDK that aims to facilitate the
        creation of applications to visualize medical images.
      </p>
    </div>
    <div className={styles.entry}>
      <p className={styles.header}>
        <span>Frontend developer at ManoMano</span>
        <span className={styles.location}>(Bordeaux, France)</span>
        <span className={styles.period}>dec 2018 -> now</span>
      </p>
      <p className={styles.description}>I work on the ManoMano website.</p>
    </div>
  </>
);
