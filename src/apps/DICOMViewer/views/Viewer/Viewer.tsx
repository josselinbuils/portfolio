import React, { FC, useEffect, useRef, useState } from 'react';
import { MouseButton } from '~/platform/constants';
import { Size } from '~/platform/interfaces';
import { ViewportElement } from '../../components';
import { MouseTool, RendererType, ViewType } from '../../constants';
import { Annotations } from '../../interfaces';
import { Dataset, Viewport } from '../../models';
import { getAvailableViewTypes, startTool } from '../../utils';
import { AnnotationsElement, Toolbar } from './components';

export const Viewer: FC<Props> = ({
  dataset,
  onError,
  rendererType,
  windowSize
}) => {
  const [activeLeftTool, setActiveLeftTool] = useState<MouseTool>(
    MouseTool.Paging
  );
  const [activeRightTool, setActiveRightTool] = useState<MouseTool>(
    MouseTool.Zoom
  );
  const [annotations, setAnnotations] = useState<Annotations>({});
  const [viewport, setViewport] = useState<Viewport>();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const viewportElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dataset !== undefined && rendererType !== undefined) {
      try {
        const availableViewTypes = getAvailableViewTypes(dataset, rendererType);
        const viewType = availableViewTypes.includes(ViewType.Axial)
          ? ViewType.Axial
          : ViewType.Native;
        const newViewport = Viewport.create(dataset, viewType, rendererType);
        setViewport(newViewport);
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
    return viewport.annotationsSubject.subscribe(setAnnotations);
  }, [viewport]);

  useEffect(() => {
    const { height, width } = windowSize;
    setViewportHeight(height - 42);
    setViewportWidth(width);
  }, [windowSize]);

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
      viewportElementRef
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

    setViewport(Viewport.create(dataset, viewType, rendererType));
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
        height={viewportHeight}
        onCanvasMouseDown={startActiveTool}
        onError={onError}
        ref={viewportElementRef}
        rendererType={rendererType}
        viewport={viewport}
        width={viewportWidth}
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
  windowSize: Size;
  onError(message: string): void;
}
