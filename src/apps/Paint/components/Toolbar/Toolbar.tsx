import { faFile } from '@fortawesome/free-regular-svg-icons/faFile';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons/faFloppyDisk';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons/faFolderOpen';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassMinus';
import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassPlus';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';

import { FONT_OPTIONS, LINE_WIDTH_PRESETS, ZOOM_LEVELS } from '../../constants';
import { usePolygonStarStore } from '../../tools/draw/polygonStar';
import { useRectStore } from '../../tools/draw/shapes';
import { useDrawStore } from '../../tools/draw/useDrawStore';
import { useTextStore } from '../../tools/text';
import { type Tool, tools } from '../../tools/tools';
import classes from './Toolbar.module.css';

export type ToolbarProps = {
  canRedo: boolean;
  canUndo: boolean;
  onClear(): void;
  onOpenImage(): void;
  onRedo(): void;
  onResetZoom(): void;
  onSaveImage(): void;
  onSetTool(t: Tool): void;
  onUndo(): void;
  onZoomIn(): void;
  onZoomOut(): void;
  tool: Tool;
  zoom: number;
};

export const Toolbar: FunctionComponent<ToolbarProps> = ({
  canRedo,
  canUndo,
  onClear,
  onOpenImage,
  onRedo,
  onResetZoom,
  onSaveImage,
  onSetTool,
  onUndo,
  onZoomIn,
  onZoomOut,
  tool,
  zoom,
}) => {
  const [showLineWidthPopover, setShowLineWidthPopover] = useState(false);
  const [widthPopoverPos, setWidthPopoverPos] = useState({ left: 0, top: 0 });
  const widthBtnRef = useRef<HTMLButtonElement>(null);
  const widthPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLineWidthPopover) {
      return;
    }

    function onClickOutside(event: MouseEvent) {
      if (widthBtnRef.current?.contains(event.target as Node)) {
        return;
      }
      setShowLineWidthPopover(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setShowLineWidthPopover(false);
        widthBtnRef.current?.focus();
      }
    }
    document.addEventListener('click', onClickOutside);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('click', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [showLineWidthPopover]);

  useEffect(() => {
    if (!showLineWidthPopover || !widthPopoverRef.current) {
      return;
    }
    const activeBtn = widthPopoverRef.current.querySelector<HTMLButtonElement>(
      '[aria-pressed="true"]',
    );
    (activeBtn ?? widthPopoverRef.current.querySelector('button'))?.focus();
  }, [showLineWidthPopover]);

  function openWidthPopover() {
    if (!widthBtnRef.current) {
      return;
    }
    const rect = widthBtnRef.current.getBoundingClientRect();
    setWidthPopoverPos({ left: rect.left, top: rect.bottom + 10 });
    setShowLineWidthPopover(true);
  }

  const showFillTip = ['circle', 'polygon', 'rect', 'star'].includes(tool);
  const showLineWidth = [
    'circle',
    'eraser',
    'pencil',
    'polygon',
    'rect',
    'star',
  ].includes(tool);
  const showTextOptions = tool === 'text';
  const showPolygonStarOptions = ['polygon', 'star'].includes(tool);
  const showRectOptions = tool === 'rect';
  const showToolOptions =
    showLineWidth ||
    showTextOptions ||
    showPolygonStarOptions ||
    showRectOptions;

  const cornerRadius = useRectStore((state) =>
    showRectOptions ? state.cornerRadius : 0,
  );
  const sides = usePolygonStarStore((state) =>
    showPolygonStarOptions ? state.sides : 5,
  );
  const fontFamily = useTextStore((state) =>
    showTextOptions ? state.fontFamily : '',
  );
  const fontSize = useTextStore((state) =>
    showTextOptions ? state.fontSize : 0,
  );
  const lineWidth = useDrawStore((state) =>
    showLineWidth ? state.lineWidth : 0,
  );

  return (
    <div aria-label="Paint tools" className={classes.options} role="toolbar">
      <div
        aria-label="Drawing tools"
        className={cn(classes.group, classes.drawingToolsGroup)}
        role="group"
      >
        {tools.map(({ description, icon, name }) => (
          <button
            aria-label={description}
            aria-pressed={tool === name}
            className={cn(classes.tool, {
              [classes.active]: tool === name,
            })}
            key={name}
            onClick={() => onSetTool(name)}
            title={description}
            type="button"
          >
            <FontAwesomeIcon className={classes[`${name}Icon`]} icon={icon} />
          </button>
        ))}
      </div>
      {showToolOptions && (
        <div aria-label="Tool options" className={classes.group} role="group">
          {showLineWidth && (
            <button
              aria-expanded={showLineWidthPopover}
              aria-haspopup="true"
              aria-label={`Stroke width: ${lineWidth}px`}
              className={classes.widthBtn}
              onClick={
                showLineWidthPopover
                  ? () => setShowLineWidthPopover(false)
                  : openWidthPopover
              }
              ref={widthBtnRef}
              type="button"
            >
              <span
                aria-hidden="true"
                className={classes.widthPreview}
                style={{
                  height: Math.max(1, Math.min(lineWidth, 14)) + 'px',
                }}
              />
              <FontAwesomeIcon icon={faCaretDown} />
            </button>
          )}
          {showRectOptions && (
            <>
              <span aria-hidden="true" className={classes.label}>
                Radius
              </span>
              <input
                aria-label="Corner radius"
                className={classes.numberInput}
                min={0}
                onInput={(event) => {
                  useRectStore.setState({
                    cornerRadius: +(event.target as HTMLInputElement).value,
                  });
                }}
                type="number"
                value={cornerRadius}
              />
            </>
          )}
          {showPolygonStarOptions && (
            <>
              <span aria-hidden="true" className={classes.label}>
                {tool === 'polygon' ? 'Sides' : 'Branches'}
              </span>
              <input
                aria-label="Number of sides"
                className={classes.numberInput}
                max={12}
                min={3}
                onInput={(event) => {
                  usePolygonStarStore.setState({
                    sides: +(event.target as HTMLInputElement).value,
                  });
                }}
                type="number"
                value={sides}
              />
            </>
          )}
          {showTextOptions && (
            <>
              <span aria-hidden="true" className={classes.label}>
                Size
              </span>
              <input
                aria-label="Font size"
                className={classes.numberInput}
                max={200}
                min={8}
                onInput={(event) => {
                  useTextStore.setState({
                    fontSize: +(event.target as HTMLInputElement).value,
                  });
                }}
                type="number"
                value={fontSize}
              />
              <span aria-hidden="true" className={classes.label}>
                Font
              </span>
              <select
                aria-label="Font family"
                className={classes.selectInput}
                onChange={(event) => {
                  useTextStore.setState({
                    fontFamily: (event.target as HTMLSelectElement).value,
                  });
                }}
                value={fontFamily}
              >
                {FONT_OPTIONS.map((fontOption) => (
                  <option key={fontOption.value} value={fontOption.value}>
                    {fontOption.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}
      {showFillTip && (
        <div
          aria-label="Mouse button hints"
          className={classes.group}
          role="group"
        >
          <span aria-label="Right click" className={classes.mouseIcon}>
            <span className={cn(classes.mouseHalf, classes.mouseHalfLeft)} />
            <span className={cn(classes.mouseHalf, classes.mouseHalfRight)} />
          </span>
          <span className={classes.fillTipLabel}>Fill</span>
        </div>
      )}
      <div
        aria-label="Zoom"
        className={classes.group}
        role="group"
        style={{ marginLeft: 'auto' }}
      >
        <button
          aria-label="Zoom out"
          className={classes.actionBtn}
          disabled={zoom <= ZOOM_LEVELS[0]}
          onClick={onZoomOut}
          title="Zoom out"
          type="button"
        >
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
        </button>
        <button
          aria-label={`Zoom: ${Math.round(zoom * 100)}% — click to reset`}
          className={classes.zoomLabel}
          onClick={onResetZoom}
          title="Reset zoom"
          type="button"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          aria-label="Zoom in"
          className={classes.actionBtn}
          disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          onClick={onZoomIn}
          title="Zoom in"
          type="button"
        >
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
        </button>
      </div>
      <div aria-label="Actions" className={classes.group} role="group">
        <button
          aria-label="New image"
          className={classes.actionBtn}
          onClick={onClear}
          title="New"
          type="button"
        >
          <FontAwesomeIcon icon={faFile} />
        </button>
        <button
          aria-label="Open image"
          className={classes.actionBtn}
          onClick={onOpenImage}
          title="Open"
          type="button"
        >
          <FontAwesomeIcon icon={faFolderOpen} />
        </button>
        <button
          aria-label="Save image"
          className={classes.actionBtn}
          onClick={onSaveImage}
          title="Save (⌘S)"
          type="button"
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
        </button>
        <button
          aria-label="Undo"
          className={classes.actionBtn}
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (⌘Z)"
          type="button"
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
        <button
          aria-label="Redo"
          className={classes.actionBtn}
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (⌘⇧Z)"
          type="button"
        >
          <FontAwesomeIcon icon={faRotateRight} />
        </button>
      </div>

      {showLineWidthPopover &&
        createPortal(
          <div
            aria-label="Stroke width options"
            className={classes.widthPopover}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
                return;
              }
              event.preventDefault();
              if (!widthPopoverRef.current) {
                return;
              }
              const buttons = Array.from(
                widthPopoverRef.current.querySelectorAll<HTMLButtonElement>(
                  'button',
                ),
              );
              const index = buttons.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              const nextIndex =
                event.key === 'ArrowDown'
                  ? (index + 1) % buttons.length
                  : (index - 1 + buttons.length) % buttons.length;
              buttons[nextIndex]?.focus();
            }}
            ref={widthPopoverRef}
            role="listbox"
            style={{ left: widthPopoverPos.left, top: widthPopoverPos.top }}
            tabIndex={-1}
          >
            {LINE_WIDTH_PRESETS.map((widthPreset) => (
              <button
                aria-label={`${widthPreset}px`}
                aria-pressed={lineWidth === widthPreset}
                className={cn(classes.wopt, {
                  [classes.woptActive]: lineWidth === widthPreset,
                })}
                key={widthPreset}
                onClick={() => {
                  useDrawStore.setState({ lineWidth: widthPreset });
                  setShowLineWidthPopover(false);
                  widthBtnRef.current?.focus();
                }}
                type="button"
              >
                <span aria-hidden="true" className={classes.check}>
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span
                  aria-hidden="true"
                  className={classes.bar}
                  style={{
                    height: Math.max(1, Math.min(widthPreset, 14)) + 'px',
                  }}
                />
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};
