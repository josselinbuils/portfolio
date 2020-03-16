import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import { WebGLRenderer } from '~/apps/DICOMViewer/renderer/webgl/WebGLRenderer';
import { MouseButton } from '~/platform/constants';
import { RendererType, ViewType } from '../../constants';
import { Viewport } from '../../models';
import { JSFrameRenderer, JSVolumeRenderer, Renderer } from '../../renderer';
import styles from './ViewportElement.module.scss';

export const ViewportElement = forwardRef<HTMLDivElement, Props>(
  ({ height, onCanvasMouseDown, rendererType, viewport, width }, ref) => {
    const canvasElementRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (!viewport) {
        return;
      }
      const canvasElement = canvasElementRef.current as HTMLCanvasElement;
      let renderer: Renderer;

      switch (rendererType) {
        case RendererType.JavaScript:
          renderer =
            (viewport as Viewport).viewType === ViewType.Native
              ? new JSFrameRenderer(canvasElement)
              : new JSVolumeRenderer(canvasElement);
          break;
        case RendererType.WebGL:
          renderer = new WebGLRenderer(canvasElement);
      }

      const render = () => {
        if (!canvasElementRef.current || !renderer || !viewport) {
          return;
        }

        if (viewport.isDirty()) {
          renderer.render(viewport);
          viewport.makeClean();
        }

        window.requestAnimationFrame(render);
      };
      render();

      return () => renderer.destroy?.();
    }, [rendererType, viewport]);

    useLayoutEffect(() => {
      viewport.height = height;
      viewport.width = width;
    }, [height, viewport, width]);

    const mouseDownListener = (downEvent: React.MouseEvent) => {
      downEvent.persist();

      if (downEvent.button === MouseButton.Right) {
        const contextMenuListener = (event: MouseEvent) => {
          event.preventDefault();
          window.removeEventListener('contextmenu', contextMenuListener);
          return false;
        };
        window.addEventListener('contextmenu', contextMenuListener);
      }

      onCanvasMouseDown(downEvent.nativeEvent);
    };

    return (
      <div className={styles.viewport} ref={ref}>
        <canvas
          height={height}
          onContextMenu={() => false}
          onMouseDown={mouseDownListener}
          ref={canvasElementRef}
          width={width}
        />
      </div>
    );
  }
);

interface Props {
  height: number;
  rendererType: RendererType;
  viewport: Viewport;
  width: number;
  onCanvasMouseDown(downEvent: MouseEvent): void;
}
