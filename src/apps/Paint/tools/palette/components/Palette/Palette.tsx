import { type FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';

import { usePaletteStore } from '../../usePaletteStore';
import classes from './Palette.module.css';

const PRESET_PALETTE = [
  '#000000',
  '#3f3f3f',
  '#7f7f7f',
  '#bfbfbf',
  '#ffffff',
  '#e20000',
  '#ff4501',
  '#cc7832',
  '#f1c40f',
  '#27ae60',
  '#16a085',
  '#00aaff',
  '#007ad8',
  '#0044cc',
  '#8e44ad',
  '#c0399b',
  '#d35400',
  '#ecf0f1',
  '#222831',
];

export type PaletteProps = {
  status: string;
};

export const Palette: FunctionComponent<PaletteProps> = ({ status }) => {
  const fillColor = usePaletteStore((state) => state.fillColor);
  const strokeColor = usePaletteStore((state) => state.strokeColor);
  const hiddenColorRef = useRef<HTMLInputElement>(null);

  function openColorPicker(target: 'fill' | 'stroke') {
    if (!hiddenColorRef.current) {
      return;
    }
    const colorInput = hiddenColorRef.current;

    colorInput.value = target === 'stroke' ? strokeColor : fillColor;

    colorInput.oninput = (event) => {
      const color = (event.target as HTMLInputElement).value;

      if (target === 'stroke') {
        usePaletteStore.setState({ strokeColor: color });
      } else {
        usePaletteStore.setState({ fillColor: color });
      }
    };
    colorInput.click();
  }

  return (
    <div className={classes.palette}>
      <div className={classes.strokeFill}>
        <button
          aria-label="Fill color"
          className={classes.sfFill}
          onClick={() => openColorPicker('fill')}
          style={{ background: fillColor }}
          type="button"
        />
        <button
          aria-label="Stroke color"
          className={classes.sfStroke}
          onClick={() => openColorPicker('stroke')}
          style={{ background: strokeColor }}
          type="button"
        />
      </div>
      <div aria-label="Color palette" className={classes.swatches} role="group">
        {PRESET_PALETTE.map((color, index) => (
          <button
            aria-label={color}
            className={classes.swatch}
            key={index}
            onClick={(event) => {
              if (
                (event as MouseEvent).shiftKey ||
                (event as MouseEvent).metaKey ||
                (event as MouseEvent).ctrlKey
              ) {
                usePaletteStore.setState({ fillColor: color });
              } else {
                usePaletteStore.setState({ strokeColor: color });
              }
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              usePaletteStore.setState({ fillColor: color });
            }}
            onKeyDown={(event) => {
              const keyboardEvent = event as KeyboardEvent;
              if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') {
                return;
              }
              keyboardEvent.preventDefault();
              if (
                keyboardEvent.shiftKey ||
                keyboardEvent.metaKey ||
                keyboardEvent.ctrlKey
              ) {
                usePaletteStore.setState({ fillColor: color });
              } else {
                usePaletteStore.setState({ strokeColor: color });
              }
            }}
            style={{ background: color }}
            title={`${color} — click: stroke · right-click / shift: fill`}
            type="button"
          />
        ))}
      </div>
      <div aria-label="status" className={classes.status}>
        {status}
      </div>
      <input
        ref={hiddenColorRef}
        style="position:absolute;width:0;height:0;opacity:0;pointer-events:none"
        type="color"
      />
    </div>
  );
};
