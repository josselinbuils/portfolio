import { type FunctionComponent } from 'preact';

import { throttle } from '@/platform/utils/throttle';

import classes from './ColorPicker.module.css';
import { hexToRGB } from './utils/hexToRGB';
import { rgbToHex } from './utils/rgbToHex';

export type ColorPickerProps = {
  color: number[];
  onColorChange(color: number[]): void;
};

export const ColorPicker: FunctionComponent<ColorPickerProps> = ({
  color,
  onColorChange,
}) => {
  const colorChangeHandler = throttle((value) => {
    const rgbColor = hexToRGB(value);

    if (rgbColor !== undefined) {
      onColorChange(rgbColor);
    }
  }, 50);

  return (
    <figure
      className={classes.colorPicker}
      style={{ background: `rgb(${color})` }}
    >
      <input
        className={classes.colorPicker}
        defaultValue={rgbToHex(color)}
        onChange={(event) => colorChangeHandler(event.currentTarget.value)}
        type="color"
      />
    </figure>
  );
};
