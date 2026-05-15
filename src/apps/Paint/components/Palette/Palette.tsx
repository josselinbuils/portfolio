import { type FunctionComponent } from 'preact';

import classes from './Palette.module.css';

export type PaletteProps = {
  fill: string;
  onAddSwatch(): void;
  onOpenColorPicker(target: 'fill' | 'stroke'): void;
  onSetFill(color: string): void;
  onSetStroke(color: string): void;
  status: string;
  stroke: string;
  swatches: string[];
};

export const Palette: FunctionComponent<PaletteProps> = ({
  fill,
  onAddSwatch,
  onOpenColorPicker,
  onSetFill,
  onSetStroke,
  status,
  stroke,
  swatches,
}) => (
  <div className={classes.palette}>
    <div className={classes.strokeFill}>
      <button
        aria-label="Fill color"
        className={classes.sfFill}
        onClick={() => onOpenColorPicker('fill')}
        style={{ background: fill }}
        type="button"
      />
      <button
        aria-label="Stroke color"
        className={classes.sfStroke}
        onClick={() => onOpenColorPicker('stroke')}
        style={{ background: stroke }}
        type="button"
      />
    </div>
    <div aria-label="Color palette" className={classes.swatches} role="group">
      {swatches.map((color, index) => (
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
              onSetFill(color);
            } else {
              onSetStroke(color);
            }
          }}
          onContextMenu={(event) => {
            (event as Event).preventDefault();
            onSetFill(color);
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
              onSetFill(color);
            } else {
              onSetStroke(color);
            }
          }}
          style={{ background: color }}
          title={`${color} — click: stroke · right-click / shift: fill`}
          type="button"
        />
      ))}
    </div>
    <button
      aria-label="Add current color to palette"
      className={classes.addSwatch}
      onClick={onAddSwatch}
      title="Save current color"
      type="button"
    >
      +
    </button>
    <div aria-label="status" className={classes.status}>
      {status}
    </div>
  </div>
);
