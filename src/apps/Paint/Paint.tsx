import type { WindowComponent } from '@/platform/components/Window/WindowComponent';

import { Window } from '@/platform/components/Window/Window';

import { Palette } from './components/Palette/Palette';
import { Toolbar } from './components/Toolbar/Toolbar';
import { CANVAS_H, CANVAS_W } from './constants';
import { useCanvasEngine } from './hooks/useCanvasEngine/useCanvasEngine';
import styles from './Paint.module.scss';

export const Paint: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const {
    addSwatch,
    canRedo,
    canUndo,
    clearCanvas,
    fill,
    fillOn,
    fontFamily,
    fontSize,
    hiddenColorRef,
    mainRef,
    onMouseDown,
    openColorPicker,
    previewRef,
    redo,
    selRef,
    setFill,
    setFillOn,
    setFontFamily,
    setFontSize,
    setStroke,
    setTolerance,
    setTool,
    setWidth,
    stageInnerRef,
    status,
    stroke,
    swatches,
    tolerance,
    tool,
    undo,
    width,
  } = useCanvasEngine(styles.textOverlay);

  const stageCursor =
    tool === 'text'
      ? styles.cursorText
      : tool === 'bucket'
        ? styles.cursorBucket
        : styles.cursorCrosshair;

  return (
    <Window
      minHeight={500}
      minWidth={800}
      ref={windowRef}
      resizable
      title="Paint"
      {...injectedWindowProps}
    >
      <div className={styles.paint}>
        <Toolbar
          canRedo={canRedo}
          canUndo={canUndo}
          fill={fill}
          fillOn={fillOn}
          fontFamily={fontFamily}
          fontSize={fontSize}
          onClear={clearCanvas}
          onFillOnChange={setFillOn}
          onFontFamilyChange={setFontFamily}
          onFontSizeChange={setFontSize}
          onOpenColorPicker={openColorPicker}
          onRedo={redo}
          onSetTool={setTool}
          onSetWidth={setWidth}
          onToleranceChange={setTolerance}
          onUndo={undo}
          stroke={stroke}
          tolerance={tolerance}
          tool={tool}
          width={width}
        />

        <div className={`${styles.stage} ${stageCursor}`}>
          <div
            className={styles.stageInner}
            ref={stageInnerRef}
            style={{ height: CANVAS_H, width: CANVAS_W }}
          >
            <canvas
              className={`${styles.canvasLayer} ${styles.mainCanvas}`}
              height={CANVAS_H}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={onMouseDown}
              ref={mainRef}
              width={CANVAS_W}
            />
            <canvas
              className={`${styles.canvasLayer} ${styles.previewCanvas}`}
              height={CANVAS_H}
              ref={previewRef}
              width={CANVAS_W}
            />
            <canvas
              className={`${styles.canvasLayer} ${styles.selectionCanvas}`}
              height={CANVAS_H}
              ref={selRef}
              width={CANVAS_W}
            />
          </div>
        </div>

        <Palette
          fill={fill}
          onAddSwatch={addSwatch}
          onOpenColorPicker={openColorPicker}
          onSetFill={setFill}
          onSetStroke={setStroke}
          status={status}
          stroke={stroke}
          swatches={swatches}
        />

        <input
          ref={hiddenColorRef}
          style="position:absolute;width:0;height:0;opacity:0;pointer-events:none"
          type="color"
        />
      </div>
    </Window>
  );
};

export default Paint;
