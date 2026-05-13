import { faCircle } from '@fortawesome/free-regular-svg-icons/faCircle';
import { faFile } from '@fortawesome/free-regular-svg-icons/faFile';
import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faEraser } from '@fortawesome/free-solid-svg-icons/faEraser';
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons/faEyeDropper';
import { faFillDrip } from '@fortawesome/free-solid-svg-icons/faFillDrip';
import { faFont } from '@fortawesome/free-solid-svg-icons/faFont';
import { faPencil } from '@fortawesome/free-solid-svg-icons/faPencil';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight';
import { faVectorPolygon } from '@fortawesome/free-solid-svg-icons/faVectorPolygon';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons/faWandMagicSparkles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { FONT_OPTIONS, WIDTH_PRESETS } from '../../constants';
import { type DrawTool } from '../../interfaces/DrawTool';
import styles from './Toolbar.module.scss';

export interface ToolbarProps {
  canRedo: boolean;
  canUndo: boolean;
  fill: string;
  fillOn: boolean;
  fontFamily: string;
  fontSize: number;
  onClear(): void;
  onFillOnChange(v: boolean): void;
  onFontFamilyChange(v: string): void;
  onFontSizeChange(v: number): void;
  onOpenColorPicker(target: 'fill' | 'stroke'): void;
  onRedo(): void;
  onSetTool(t: DrawTool): void;
  onSetWidth(v: number): void;
  onToleranceChange(v: number): void;
  onUndo(): void;
  stroke: string;
  tolerance: number;
  tool: DrawTool;
  width: number;
}

export const Toolbar: FunctionComponent<ToolbarProps> = ({
  canRedo,
  canUndo,
  fill,
  fillOn,
  fontFamily,
  fontSize,
  onClear,
  onFillOnChange,
  onFontFamilyChange,
  onFontSizeChange,
  onOpenColorPicker,
  onRedo,
  onSetTool,
  onSetWidth,
  onToleranceChange,
  onUndo,
  stroke,
  tolerance,
  tool,
  width,
}) => {
  const [showWidthPopover, setShowWidthPopover] = useState(false);
  const [widthPopoverPos, setWidthPopoverPos] = useState({ left: 0, top: 0 });
  const widthBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showWidthPopover) return;
    function onOutside(e: MouseEvent) {
      if (widthBtnRef.current?.contains(e.target as Node)) return;
      setShowWidthPopover(false);
    }
    document.addEventListener('click', onOutside);
    return () => document.removeEventListener('click', onOutside);
  }, [showWidthPopover]);

  function openWidthPopover() {
    const r = widthBtnRef.current!.getBoundingClientRect();
    setWidthPopoverPos({ left: r.left, top: r.bottom + 10 });
    setShowWidthPopover(true);
  }

  const showColors = !['picker', 'select', 'wand'].includes(tool);
  const showFillToggle = ['circle', 'rect', 'rectRound'].includes(tool);
  const showWidth = !['bucket', 'picker', 'select', 'text', 'wand'].includes(
    tool,
  );
  const showTolerance = ['bucket', 'wand'].includes(tool);
  const showTextOpts = tool === 'text';

  return (
    <div className={styles.options}>
      {/* Tools */}
      <div className={styles.toolsGroup}>
        {(
          [
            ['select', faVectorPolygon, 'Marquee select — M'],
            ['wand', faWandMagicSparkles, 'Magic wand — W'],
            ['pencil', faPencil, 'Pencil — B'],
            ['eraser', faEraser, 'Eraser — E'],
            ['rect', faSquare, 'Rectangle — R'],
            ['rectRound', faSquare, 'Rounded rectangle'],
            ['circle', faCircle, 'Ellipse — C'],
            ['text', faFont, 'Text — T'],
            ['bucket', faFillDrip, 'Paint bucket — G'],
            ['picker', faEyeDropper, 'Eyedropper — I'],
          ] as const
        ).map(([t, icon, tip]) => (
          <button
            className={`${styles.tool} ${tool === t ? styles.active : ''}`}
            data-tip={tip}
            key={t}
            onClick={() => onSetTool(t as DrawTool)}
            style={t === 'rectRound' ? 'border-radius:5px' : undefined}
            type="button"
          >
            <FontAwesomeIcon icon={icon} />
          </button>
        ))}
      </div>

      {/* Colors */}
      {showColors && (
        <div className={styles.group}>
          <div
            className={styles.dualSwatch}
            title="Stroke (front) / Fill (back)"
          >
            <button
              aria-label="Fill color"
              className={styles.dsFill}
              onClick={() => onOpenColorPicker('fill')}
              style={{ background: fill }}
              type="button"
            />
            <button
              aria-label="Stroke color"
              className={styles.dsStroke}
              onClick={() => onOpenColorPicker('stroke')}
              style={{ background: stroke }}
              type="button"
            />
          </div>
          {showFillToggle && (
            <label className={styles.checkbox}>
              <input
                checked={fillOn}
                onChange={(e) =>
                  onFillOnChange((e.target as HTMLInputElement).checked)
                }
                type="checkbox"
              />
              Fill shape
            </label>
          )}
        </div>
      )}

      {/* Stroke width */}
      {showWidth && (
        <div className={styles.group}>
          <button
            aria-expanded={showWidthPopover}
            className={styles.widthBtn}
            onClick={
              showWidthPopover
                ? () => setShowWidthPopover(false)
                : openWidthPopover
            }
            ref={widthBtnRef}
            type="button"
          >
            <span
              className={styles.widthPreview}
              style={{ height: Math.max(1, Math.min(width, 14)) + 'px' }}
            />
            <FontAwesomeIcon icon={faCaretDown} />
          </button>
        </div>
      )}

      {/* Tolerance */}
      {showTolerance && (
        <div className={styles.group}>
          <span className={styles.label}>Tolerance</span>
          <input
            className={styles.toleranceSlider}
            max={128}
            min={0}
            onInput={(e) =>
              onToleranceChange(+(e.target as HTMLInputElement).value)
            }
            type="range"
            value={tolerance}
          />
          <input
            className={styles.numberInput}
            max={255}
            min={0}
            onInput={(e) =>
              onToleranceChange(+(e.target as HTMLInputElement).value)
            }
            type="number"
            value={tolerance}
          />
        </div>
      )}

      {/* Text options */}
      {showTextOpts && (
        <div className={styles.group}>
          <span className={styles.label}>Size</span>
          <input
            className={styles.numberInput}
            max={200}
            min={8}
            onInput={(e) =>
              onFontSizeChange(+(e.target as HTMLInputElement).value)
            }
            type="number"
            value={fontSize}
          />
          <span className={styles.label}>Font</span>
          <select
            className={styles.selectInput}
            onChange={(e) =>
              onFontFamilyChange((e.target as HTMLSelectElement).value)
            }
            value={fontFamily}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className={styles.group}>
        <button
          className={styles.actionBtn}
          onClick={onClear}
          title="New"
          type="button"
        >
          <FontAwesomeIcon icon={faFile} />
        </button>
        <button
          className={styles.actionBtn}
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (⌘Z)"
          type="button"
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
        <button
          className={styles.actionBtn}
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (⌘⇧Z)"
          type="button"
        >
          <FontAwesomeIcon icon={faRotateRight} />
        </button>
      </div>

      {/* Width popover — position:fixed so it escapes the toolbar */}
      {showWidthPopover && (
        <div
          className={styles.widthPopover}
          style={{ left: widthPopoverPos.left, top: widthPopoverPos.top }}
        >
          {WIDTH_PRESETS.map((w) => (
            <button
              className={`${styles.wopt} ${width === w ? styles.woptActive : ''}`}
              key={w}
              onClick={() => {
                onSetWidth(w);
                setShowWidthPopover(false);
              }}
              type="button"
            >
              <span className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span
                className={styles.bar}
                style={{ height: Math.max(1, Math.min(w, 14)) + 'px' }}
              />
              <span className={styles.woptLabel}>{w}px</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
