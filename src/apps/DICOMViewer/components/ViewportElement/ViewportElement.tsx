import React, {
  forwardRef,
  MouseEvent,
  useEffect,
  useRef,
  useState
} from 'react';
import { WebGLRenderer } from '~/apps/DICOMViewer/renderer/webgl/WebGLRenderer';
import { RendererType, ViewType } from '../../constants';
import { Viewport } from '../../models';
import { JSFrameRenderer, JSVolumeRenderer, Renderer } from '../../renderer';

export const ViewportElement = forwardRef<HTMLDivElement, Props>(
  ({ height, onCanvasMouseDown, rendererType, viewport, width }, ref) => {
    const [renderer, setRenderer] = useState<Renderer>();
    const canvasElementRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (!viewport) {
        return;
      }
      const canvasElement = canvasElementRef.current as HTMLCanvasElement;

      switch (rendererType) {
        case RendererType.JavaScript:
          setRenderer(
            (viewport as Viewport).viewType === ViewType.Native
              ? new JSFrameRenderer(canvasElement)
              : new JSVolumeRenderer(canvasElement)
          );
          break;
        case RendererType.WebGL:
          setRenderer(new WebGLRenderer(canvasElement));
      }
      return () => renderer?.destroy?.();
    }, [renderer, rendererType, viewport]);

    useEffect(() => {
      viewport.height = height;
      viewport.width = width;
    }, [height, viewport, width]);

    return (
      <div ref={ref}>
        <canvas
          height={height}
          onMouseDown={onCanvasMouseDown}
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
