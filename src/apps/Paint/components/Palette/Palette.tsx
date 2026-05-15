import { type FunctionComponent } from 'preact';

import styles from './Palette.module.css';

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
  <div className={styles.palette}>
    <div className={styles.strokeFill}>
      <button
        aria-label="Fill color"
        className={styles.sfFill}
        onClick={() => onOpenColorPicker('fill')}
        style={{ background: fill }}
        type="button"
      />
      <button
        aria-label="Stroke color"
        className={styles.sfStroke}
        onClick={() => onOpenColorPicker('stroke')}
        style={{ background: stroke }}
        type="button"
      />
    </div>
    <div aria-label="Color palette" className={styles.swatches} role="group">
      {swatches.map((c, i) => (
        <button
          aria-label={c}
          className={styles.swatch}
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
      className={styles.addSwatch}
      onClick={onAddSwatch}
      title="Save current color"
      type="button"
    >
      +
    </button>
    <div aria-label="status" className={styles.status}>
      {status}
    </div>
  </div>
);
