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
      {swatches.map((c, i) => (
        <button
          aria-label={c}
          className={classes.swatch}
          key={i}
          onClick={(e) => {
            if (
              (e as MouseEvent).shiftKey ||
              (e as MouseEvent).metaKey ||
              (e as MouseEvent).ctrlKey
            )
              onSetFill(c);
            else onSetStroke(c);
          }}
          onContextMenu={(e) => {
            (e as Event).preventDefault();
            onSetFill(c);
          }}
          onKeyDown={(e) => {
            const ke = e as KeyboardEvent;
            if (ke.key !== 'Enter' && ke.key !== ' ') return;
            ke.preventDefault();
            if (ke.shiftKey || ke.metaKey || ke.ctrlKey) onSetFill(c);
            else onSetStroke(c);
          }}
          style={{ background: c }}
          title={`${c} — click: stroke · right-click / shift: fill`}
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
