import React, { FC } from 'react';
import { throttle } from '~/platform/utils/throttle';
import { hexToRGB } from './utils/hexToRGB';
import { rgbToHex } from './utils/rgbToHex';

import styles from './ColorPicker.module.scss';

export const ColorPicker: FC<Props> = ({ color, onColorChange }) => {
  const colorChangeHandler = throttle((value) => {
    const rgbColor = hexToRGB(value);

    if (rgbColor !== undefined) {
      onColorChange(rgbColor);
    }
  }, 50);

  return (
    <figure
      className={styles.colorPicker}
      style={{ background: `rgb(${color})` }}
    >
      <input
        className={styles.colorPicker}
        defaultValue={rgbToHex(color)}
        onChange={(event) => colorChangeHandler(event.target.value)}
        type="color"
      />
    </figure>
  );
};

interface Props {
  color: number[];
  onColorChange(color: number[]): void;
}
