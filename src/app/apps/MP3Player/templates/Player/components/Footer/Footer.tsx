import React, { FC } from 'react';
import { MusicPreview } from '../../../../components';
import { Music } from '../../../../interfaces';
import styles from './Footer.module.scss';

export const Footer: FC<Props> = ({ currentMusic }) => (
  <footer className={styles.footer}>
    <MusicPreview music={currentMusic} size={56} />
  </footer>
);

interface Props {
  currentMusic?: Music;
}
