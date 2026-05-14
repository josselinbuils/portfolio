import { faFile } from '@fortawesome/free-regular-svg-icons/faFile';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FunctionComponent } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';

import { FONT_OPTIONS, WIDTH_PRESETS } from '../../constants';
import { type DrawTool, tools } from '../../tools/tools';
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
  const widthPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showWidthPopover) return;

    function onClickOutside(event: MouseEvent) {
      if (widthBtnRef.current?.contains(event.target as Node)) {
        return;
      }
      setShowWidthPopover(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setShowWidthPopover(false);
        widthBtnRef.current?.focus();
      }
    }
    document.addEventListener('click', onClickOutside);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('click', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [showWidthPopover]);

  useEffect(() => {
    if (!showWidthPopover || !widthPopoverRef.current) {
      return;
    }
    const activeBtn = widthPopoverRef.current.querySelector<HTMLButtonElement>(
      '[aria-pressed="true"]',
    );
    (activeBtn ?? widthPopoverRef.current.querySelector('button'))?.focus();
  }, [showWidthPopover]);

  function openWidthPopover() {
    const r = widthBtnRef.current!.getBoundingClientRect();
    setWidthPopoverPos({ left: r.left, top: r.bottom + 10 });
    setShowWidthPopover(true);
  }

  const showColors = !['colorPicker', 'select'].includes(tool);
  const showFillToggle = ['circle', 'rect', 'rectRound'].includes(tool);
  const showWidth = !['colorPicker', 'paintBucket', 'select', 'text'].includes(
    tool,
  );
  const showTolerance = ['paintBucket'].includes(tool);
  const showTextOpts = tool === 'text';

  return (
    <div aria-label="Paint tools" className={styles.options} role="toolbar">
      {/* Tools */}
      <div
        aria-label="Drawing tools"
        className={styles.toolsGroup}
        role="group"
      >
        {tools.map(({ description, icon, name, shortcut }) => (
          <button
            aria-label={`${description} (${shortcut.toUpperCase()})`}
            aria-pressed={tool === name}
            className={`${styles.tool} ${tool === name ? styles.active : ''}`}
            data-tip={`${description} - ${shortcut.toUpperCase()}`}
            key={name}
            onClick={() => onSetTool(name)}
            style={name === 'rectRound' ? 'border-radius:5px' : undefined}
            type="button"
          >
            <FontAwesomeIcon icon={icon} />
          </button>
        ))}
      </div>

      {/* Colors */}
      {showColors && (
        <div aria-label="Colors" className={styles.group} role="group">
          <div
            className={styles.dualSwatch}
            title="Stroke (front) / Fill (back)"
          >
            <button
              aria-label={`Fill color: ${fill}`}
              className={styles.dsFill}
              onClick={() => onOpenColorPicker('fill')}
              style={{ background: fill }}
              type="button"
            />
            <button
              aria-label={`Stroke color: ${stroke}`}
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
        <div aria-label="Stroke width" className={styles.group} role="group">
          <button
            aria-expanded={showWidthPopover}
            aria-haspopup="true"
            aria-label={`Stroke width: ${width}px`}
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
              aria-hidden="true"
              className={styles.widthPreview}
              style={{ height: Math.max(1, Math.min(width, 14)) + 'px' }}
            />
            <FontAwesomeIcon icon={faCaretDown} />
          </button>
        </div>
      )}

      {/* Tolerance */}
      {showTolerance && (
        <div
          aria-label="Paint bucket options"
          className={styles.group}
          role="group"
        >
          <span aria-hidden="true" className={styles.label}>
            Tolerance
          </span>
          <input
            aria-label="Tolerance"
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
            aria-label="Tolerance"
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
        <div aria-label="Text options" className={styles.group} role="group">
          <span aria-hidden="true" className={styles.label}>
            Size
          </span>
          <input
            aria-label="Font size"
            className={styles.numberInput}
            max={200}
            min={8}
            onInput={(e) =>
              onFontSizeChange(+(e.target as HTMLInputElement).value)
            }
            type="number"
            value={fontSize}
          />
          <span aria-hidden="true" className={styles.label}>
            Font
          </span>
          <select
            aria-label="Font family"
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
      <div aria-label="Actions" className={styles.group} role="group">
        <button
          aria-label="New image"
          className={styles.actionBtn}
          onClick={onClear}
          title="New"
          type="button"
        >
          <FontAwesomeIcon icon={faFile} />
        </button>
        <button
          aria-label="Undo"
          className={styles.actionBtn}
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (⌘Z)"
          type="button"
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
        <button
          aria-label="Redo"
          className={styles.actionBtn}
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (⌘⇧Z)"
          type="button"
        >
          <FontAwesomeIcon icon={faRotateRight} />
        </button>
      </div>

      {showWidthPopover &&
        createPortal(
          <div
            aria-label="Stroke width options"
            className={styles.widthPopover}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
              e.preventDefault();
              const buttons = Array.from(
                widthPopoverRef.current!.querySelectorAll<HTMLButtonElement>(
                  'button',
                ),
              );
              const idx = buttons.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              const next =
                e.key === 'ArrowDown'
                  ? (idx + 1) % buttons.length
                  : (idx - 1 + buttons.length) % buttons.length;
              buttons[next]?.focus();
            }}
            ref={widthPopoverRef}
            role="listbox"
            style={{ left: widthPopoverPos.left, top: widthPopoverPos.top }}
            tabIndex={-1}
          >
            {WIDTH_PRESETS.map((w) => (
              <button
                aria-label={`${w}px`}
                aria-pressed={width === w}
                className={`${styles.wopt} ${width === w ? styles.woptActive : ''}`}
                key={w}
                onClick={() => {
                  onSetWidth(w);
                  setShowWidthPopover(false);
                  widthBtnRef.current?.focus();
                }}
                type="button"
              >
                <span aria-hidden="true" className={styles.check}>
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span
                  aria-hidden="true"
                  className={styles.bar}
                  style={{ height: Math.max(1, Math.min(w, 14)) + 'px' }}
                />
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};
