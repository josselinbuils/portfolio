import React, { FC } from 'react';
import { RendererType } from '../../constants';
import javascript from './images/javascript.png';
import webgl from './images/webgl.png';
import styles from './SelectRenderer.module.scss';

const renderers = [
  { type: RendererType.JavaScript, logo: javascript },
  { type: RendererType.WebGL, logo: webgl }
];

export const SelectRenderer: FC<Props> = ({ onRendererTypeSelected }) => (
  <div className={styles.selectRenderer}>
    <h1>Select the renderer</h1>
    <div className={styles.container}>
      {renderers.map(({ logo, type }) => (
        <img
          alt={type}
          className={styles.renderer}
          key={type}
          onClick={() => onRendererTypeSelected(type)}
          src={logo}
        />
      ))}
    </div>
  </div>
);

interface Props {
  onRendererTypeSelected(rendererType: RendererType): void;
}
