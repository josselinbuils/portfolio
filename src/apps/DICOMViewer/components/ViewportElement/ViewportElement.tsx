import cn from 'classnames';
import { type FC, useEffect, useLayoutEffect, useRef } from 'preact/compat';
import { RendererType, ViewType } from '@/apps/DICOMViewer/constants';
import { MouseButton } from '@/platform/constants';
import { useElementSize } from '@/platform/hooks/useElementSize';
import { type Size } from '@/platform/interfaces/Size';
import { type ViewportStats } from '../../interfaces/ViewportStats';
import { type Viewport } from '../../models/Viewport';
import styles from './ViewportElement.module.scss';
import { type Renderer } from './renderers/Renderer';

const ANNOTATIONS_REFRESH_DELAY = 500;

export const ViewportElement: FC<Props> = ({
  className,
  onCanvasMouseDown = () => {},
  onError,
  onResize = () => {},
  onStatsUpdate = () => {},
  viewport,
}) => {
  const jsCanvasElementRef = useRef<HTMLCanvasElement>(null);
  const webGLCanvasElementRef = useRef<HTMLCanvasElement>(null);
  const canvasElementRef =
    viewport.rendererType === RendererType.JavaScript
      ? jsCanvasElementRef
      : webGLCanvasElementRef;
  const [viewportWidth, viewportHeight] = useElementSize(canvasElementRef);

  useEffect(() => {
    if (!viewport) {
      return;
    }
    const canvasElement = canvasElementRef.current as HTMLCanvasElement;
    let renderer: Renderer | undefined;
    let frameDurations: number[] = [];
    let renderDurations: number[] = [];
    let lastTime = 0;
    let requestID: number;

    Promise.resolve()
      .then<new (canvas: HTMLCanvasElement) => Renderer>(() => {
        switch (viewport.rendererType) {
          case RendererType.JavaScript:
            if (viewport.viewType === ViewType.Native) {
              return import('./renderers/js/JSFrameRenderer').then(
                (m) => m.JSFrameRenderer,
              );
            }
            return import('./renderers/js/JSVolumeRenderer').then(
              (m) => m.JSVolumeRenderer,
            );

          case RendererType.WebGL:
            return import('./renderers/webgl/WebGLRenderer').then(
              (m) => m.WebGLRenderer,
            );

          default:
            throw new Error('Unknown renderer type');
        }
      })
      .then((ViewportRenderer) => {
        renderer = new ViewportRenderer(canvasElement);
      })
      .catch((error) => {
        onError(`Unable to instantiate ${viewport.rendererType} renderer`);
        console.error(error);
      });

    const render = async () => {
      if (
        canvasElementRef.current &&
        renderer &&
        viewport &&
        viewport.isDirty() &&
        viewport.width > 0 &&
        viewport.height > 0
      ) {
        const t = performance.now();

        try {
          await renderer.render(viewport);
          viewport.makeClean();
          renderDurations.push(performance.now() - t);

          if (lastTime > 0) {
            frameDurations.push(t - lastTime);
          }
          lastTime = t;
        } catch (error) {
          onError('Unable to render viewport');
          console.error(error);
          return;
        }
      }

      requestID = window.requestAnimationFrame(render);
    };

    const statsInterval = window.setInterval(() => {
      if (viewport === undefined) {
        return;
      }
      let fps: number;
      let meanRenderDuration: number;

      if (frameDurations.length > 1) {
        const meanFrameDuration =
          frameDurations.reduce((sum, d) => sum + d, 0) / frameDurations.length;
        fps = Math.round(1000 / meanFrameDuration);
        frameDurations = [];
      } else {
        fps = 0;
      }

      if (renderDurations.length > 0) {
        meanRenderDuration =
          renderDurations.reduce((sum, d) => sum + d, 0) /
          renderDurations.length;
        renderDurations = [];
      } else {
        meanRenderDuration = 0;
      }

      const stats: { fps: number; meanRenderDuration?: number } = { fps };

      if (meanRenderDuration !== 0) {
        stats.meanRenderDuration = meanRenderDuration;
      }

      onStatsUpdate(stats);
    }, ANNOTATIONS_REFRESH_DELAY);

    render();

    return () => {
      cancelAnimationFrame(requestID);
      clearInterval(statsInterval);

      if (renderer?.destroy) {
        renderer.destroy();
      }
    };
  }, [canvasElementRef, onError, onStatsUpdate, viewport]);

  useLayoutEffect(() => {
    viewport.height = viewportHeight;
    viewport.width = viewportWidth;
    onResize({ height: viewportHeight, width: viewportWidth });
  }, [onResize, viewport, viewportHeight, viewportWidth]);

  const mouseDownListener = (downEvent: MouseEvent) => {
    if (downEvent.button === MouseButton.Right) {
      const contextMenuListener = (event: MouseEvent) => {
        event.preventDefault();
        window.removeEventListener('contextmenu', contextMenuListener);
      };
      window.addEventListener('contextmenu', contextMenuListener);
    }

    onCanvasMouseDown(downEvent);
  };

  return (
    <div className={cn(styles.viewport, className)}>
      <canvas
        height={viewportHeight}
        key={viewport.rendererType}
        onContextMenu={() => false}
        onMouseDown={mouseDownListener}
        ref={canvasElementRef}
        width={viewportWidth}
      />
    </div>
  );
};

interface Props {
  className?: string;
  viewport: Viewport;
  onCanvasMouseDown?(downEvent: MouseEvent): void;
  onError(message: string): void;
  onResize?(size: Size): void;
  onStatsUpdate?(stats: ViewportStats): void;
}
