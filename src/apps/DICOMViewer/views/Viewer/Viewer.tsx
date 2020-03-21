import React, { FC, useEffect, useRef, useState } from 'react';
import { MouseButton } from '~/platform/constants';
import { ViewportElement } from '../../components';
import { MouseTool, RendererType, ViewType } from '../../constants';
import { Dataset, Viewport } from '../../models';
import { getAvailableViewTypes } from '../../utils';
import { Annotations } from './Annotations';
import { AnnotationsElement, Toolbar } from './components';
import { startTool } from './utils';

export const Viewer: FC<Props> = ({ dataset, onError, rendererType }) => {
  const [activeLeftTool, setActiveLeftTool] = useState<MouseTool>(
    MouseTool.Paging
  );
  const [activeRightTool, setActiveRightTool] = useState<MouseTool>(
    MouseTool.Zoom
  );
  const [annotations, setAnnotations] = useState<Annotations>({});
  const [viewport, setViewport] = useState<Viewport>();
  const [viewportStats, setViewportStats] = useState<object>();
  const viewportElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dataset !== undefined && rendererType !== undefined) {
      try {
        const availableViewTypes = getAvailableViewTypes(dataset, rendererType);
        const viewType = availableViewTypes.includes(ViewType.Axial)
          ? ViewType.Axial
          : ViewType.Native;
        setViewport(Viewport.create(dataset, viewType));
        setAnnotations({ datasetName: dataset.name, rendererType });
      } catch (error) {
        onError('Unable to create viewport');
        console.error(error);
      }
    }
  }, [dataset, onError, rendererType]);

  useEffect(() => {
    if (viewport === undefined) {
      return;
    }
    setActiveLeftTool(
      viewport.dataset.frames.length > 1
        ? MouseTool.Paging
        : MouseTool.Windowing
    );
    const { viewType, windowCenter, windowWidth } = viewport;
    const zoom = viewport.getImageZoom();

    setAnnotations(previousAnnotations => ({
      ...previousAnnotations,
      viewType,
      windowCenter,
      windowWidth,
      zoom
    }));
  }, [viewport]);

  useEffect(
    () =>
      setAnnotations(previousAnnotations => ({
        ...previousAnnotations,
        ...viewportStats
      })),
    [viewportStats]
  );

  function selectActiveTool(tool: MouseTool, button: MouseButton): void {
    switch (button) {
      case MouseButton.Left:
        setActiveLeftTool(tool);
        break;
      case MouseButton.Right:
        setActiveRightTool(tool);
        break;
      default:
        throw new Error('Unknown button');
    }
  }

  function startActiveTool(downEvent: MouseEvent): void {
    startTool(
      downEvent,
      activeLeftTool,
      activeRightTool,
      viewport as Viewport,
      viewportElementRef,
      (tool: MouseTool, ...additionalArgs) => {
        if (viewport === undefined) {
          return;
        }
        switch (tool) {
          case MouseTool.Rotate:
            if (viewport.viewType !== ViewType.Oblique) {
              viewport.viewType = ViewType.Oblique;

              setAnnotations(previousAnnotations => ({
                ...previousAnnotations,
                viewType: viewport.viewType
              }));
            }
            setAnnotations(previousAnnotations => ({
              ...previousAnnotations,
              zoom: viewport.getImageZoom()
            }));
            break;

          case MouseTool.Windowing:
            const { windowCenter, windowWidth } = additionalArgs[0];

            setAnnotations(previousAnnotations => ({
              ...previousAnnotations,
              windowCenter,
              windowWidth
            }));
            break;

          case MouseTool.Zoom:
            const { zoom } = additionalArgs[0];

            setAnnotations(previousAnnotations => ({
              ...previousAnnotations,
              zoom
            }));
        }
      }
    );
  }

  function switchViewType(viewType: ViewType): void {
    if (dataset === undefined) {
      throw new Error('Dataset undefined');
    }
    if (rendererType === undefined) {
      throw new Error('Renderer type undefined');
    }

    if (viewType === ViewType.Native) {
      if (activeLeftTool === MouseTool.Rotate) {
        setActiveLeftTool(MouseTool.Paging);
      }
      if (activeRightTool === MouseTool.Rotate) {
        setActiveRightTool(MouseTool.Paging);
      }
    }

    setViewport(Viewport.create(dataset, viewType));
  }

  if (!viewport) {
    return null;
  }

  return (
    <>
      <Toolbar
        activeLeftTool={activeLeftTool}
        activeRightTool={activeRightTool}
        viewport={viewport}
        onToolSelected={selectActiveTool}
      />
      <ViewportElement
        onCanvasMouseDown={startActiveTool}
        onError={onError}
        onStatsUpdate={setViewportStats}
        ref={viewportElementRef}
        rendererType={rendererType}
        viewport={viewport}
      />
      <AnnotationsElement
        annotations={annotations}
        availableViewTypes={getAvailableViewTypes(
          viewport.dataset,
          rendererType
        )}
        onViewTypeSwitch={switchViewType}
      />
    </>
  );
};

interface Props {
  dataset: Dataset;
  rendererType: RendererType;
  onError(message: string): void;
}
