import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { AnnotationsElement } from '~/apps/DICOMViewer/components/ViewportElement/AnnotationsElement';
import { Annotations } from '~/apps/DICOMViewer/interfaces';
import { WebGLRenderer } from '~/apps/DICOMViewer/renderer/webgl/WebGLRenderer';
import { getAvailableViewTypes } from '~/apps/DICOMViewer/utils';
import { MouseButton } from '~/platform/constants';
import { RendererType, ViewType } from '../../constants';
import { Viewport } from '../../models';
import { JSFrameRenderer, JSVolumeRenderer, Renderer } from '../../renderer';
import styles from './ViewportElement.module.scss';

const ANNOTATIONS_REFRESH_DELAY = 500;

export const ViewportElement = forwardRef<HTMLDivElement, Props>(
  (
    {
      height,
      onCanvasMouseDown,
      onError,
      onViewTypeSwitch,
      rendererType,
      viewport,
      width
    },
    ref
  ) => {
    const [annotations, setAnnotations] = useState<Annotations>({});
    const canvasElementRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (viewport !== undefined) {
        return viewport.annotationsSubject.subscribe(setAnnotations);
      }
    }, [viewport]);

    useEffect(() => {
      if (!viewport) {
        return;
      }
      const canvasElement = canvasElementRef.current as HTMLCanvasElement;
      let renderer: Renderer;
      let frameDurations: number[] = [];
      let renderDurations: number[] = [];
      let lastTime = performance.now();

      try {
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
      } catch (error) {
        onError(`Unable to instantiate ${rendererType} renderer`);
        console.error(error);
      }

      const render = () => {
        if (!canvasElementRef.current || !renderer || !viewport) {
          return;
        }

        if (viewport.isDirty()) {
          const t = performance.now();

          try {
            renderer.render(viewport);
            viewport.makeClean();
            renderDurations.push(performance.now() - t);
            frameDurations.push(t - lastTime);
            lastTime = t;
          } catch (error) {
            onError('Unable to render viewport');
            console.error(error);
            return;
          }
        }

        window.requestAnimationFrame(render);
      };

      const statsInterval = window.setInterval(() => {
        if (viewport === undefined) {
          return;
        }
        let fps: number;
        let meanRenderDuration: number;

        if (frameDurations.length > 0) {
          const meanFrameDuration =
            frameDurations.reduce((sum, d) => sum + d, 0) /
            frameDurations.length;
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

        viewport.updateAnnotations({ fps, meanRenderDuration });
        viewport.updateAnnotations();
      }, ANNOTATIONS_REFRESH_DELAY);

      render();
      viewport.updateAnnotations();

      return () => {
        clearInterval(statsInterval);
        renderer.destroy?.();
      };
    }, [onError, rendererType, viewport]);

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
        <AnnotationsElement
          annotations={annotations}
          availableViewTypes={getAvailableViewTypes(
            viewport.dataset,
            rendererType
          )}
          onViewTypeSwitch={onViewTypeSwitch}
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
  onError(message: string): void;
  onViewTypeSwitch(viewType: ViewType): void;
}
