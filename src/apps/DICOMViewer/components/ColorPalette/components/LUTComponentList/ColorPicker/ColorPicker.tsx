import { type FC } from 'preact/compat';
import { throttle } from '@/platform/utils/throttle';
import styles from './ColorPicker.module.scss';
import { hexToRGB } from './utils/hexToRGB';
import { rgbToHex } from './utils/rgbToHex';

export interface ColorPickerProps {
  color: number[];
  onColorChange(color: number[]): void;
}

export const ColorPicker: FC<ColorPickerProps> = ({ color, onColorChange }) => {
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
        onChange={(event) => colorChangeHandler(event.currentTarget.value)}
        type="color"
      />
    </figure>
  );
};
