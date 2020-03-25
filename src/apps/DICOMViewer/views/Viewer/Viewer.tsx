import React, { FC, useCallback, useLayoutEffect, useState } from 'react';
import { ViewportElement } from '~/apps/DICOMViewer/components';
import {
  MouseTool,
  RendererType,
  ViewType,
} from '~/apps/DICOMViewer/constants';
import { LUTComponent } from '~/apps/DICOMViewer/interfaces';
import { Dataset, Viewport } from '~/apps/DICOMViewer/models';
import { getAvailableViewTypes, startTool } from '~/apps/DICOMViewer/utils';
import { ColorPalette } from '~/apps/DICOMViewer/views';
import { MouseButton } from '~/platform/constants';
import { Annotations } from './Annotations';
import { AnnotationsElement, LeftToolbar } from './components';

export const Viewer: FC<Props> = ({ dataset, onError }) => {
  const [activeLeftTool, setActiveLeftTool] = useState<MouseTool>(
    MouseTool.Paging
  );
  const [activeRightTool, setActiveRightTool] = useState<MouseTool>(
    MouseTool.Zoom
  );
  const [annotations, setAnnotations] = useState<Annotations>({});
  const [lutComponents, setLUTComponents] = useState<LUTComponent[]>();
  const [rendererType, setRendererType] = useState<RendererType>(
    RendererType.JavaScript
  );
  const [viewport, setViewport] = useState<Viewport>();
  const [viewportStats, setViewportStats] = useState<object>();

  useLayoutEffect(() => {
    if (dataset !== undefined) {
      try {
        const availableViewTypes = getAvailableViewTypes(dataset, rendererType);
        const viewType = availableViewTypes.includes(ViewType.Axial)
          ? ViewType.Axial
          : ViewType.Native;

        setViewport((previousViewport) => {
          if (
            previousViewport === undefined ||
            previousViewport.dataset !== dataset ||
            previousViewport.viewType !== viewType
          ) {
            return Viewport.create(dataset, viewType, rendererType);
          }
          // Keeps the camera when only the renderer type changes
          return previousViewport.clone({ rendererType });
        });
        setAnnotations({ datasetName: dataset.name, rendererType });
      } catch (error) {
        onError('Unable to create viewport');
        console.error(error);
      }
    }
  }, [dataset, onError, rendererType]);

  useLayoutEffect(() => {
    setViewport((currentViewport) => {
      if (currentViewport !== undefined) {
        return currentViewport.clone({ lutComponents });
      }
    });
  }, [lutComponents]);

  useLayoutEffect(() => {
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

    setAnnotations((previousAnnotations) => ({
      ...previousAnnotations,
      viewType,
      windowCenter,
      windowWidth,
      zoom,
    }));
  }, [viewport]);

  useLayoutEffect(
    () =>
      setAnnotations((previousAnnotations) => ({
        ...previousAnnotations,
        ...viewportStats,
      })),
    [viewportStats]
  );

  const handleViewportResize = useCallback(() => {
    if (viewport !== undefined) {
      setAnnotations((previousAnnotations) => ({
        ...previousAnnotations,
        zoom: viewport.getImageZoom(),
      }));
    }
  }, [viewport]);

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
      viewport as Viewport,
      activeLeftTool,
      MouseTool.Pan,
      activeRightTool,
      (tool: MouseTool, ...additionalArgs) => {
        if (viewport === undefined) {
          return;
        }
        switch (tool) {
          case MouseTool.Rotate:
            if (viewport.viewType !== ViewType.Oblique) {
              viewport.viewType = ViewType.Oblique;

              setAnnotations((previousAnnotations) => ({
                ...previousAnnotations,
                viewType: viewport.viewType,
              }));
            }
            setAnnotations((previousAnnotations) => ({
              ...previousAnnotations,
              zoom: viewport.getImageZoom(),
            }));
            break;

          case MouseTool.Windowing:
            const { windowCenter, windowWidth } = additionalArgs[0];

            setAnnotations((previousAnnotations) => ({
              ...previousAnnotations,
              windowCenter,
              windowWidth,
            }));
            break;

          case MouseTool.Zoom:
            const { zoom } = additionalArgs[0];

            setAnnotations((previousAnnotations) => ({
              ...previousAnnotations,
              zoom,
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

    setViewport(Viewport.create(dataset, viewType, rendererType));
  }

  if (!viewport) {
    return null;
  }

  return (
    <>
      <LeftToolbar
        activeLeftTool={activeLeftTool}
        activeRightTool={activeRightTool}
        viewport={viewport}
        onToolSelected={selectActiveTool}
      />
      <ViewportElement
        onCanvasMouseDown={startActiveTool}
        onError={onError}
        onResize={handleViewportResize}
        onStatsUpdate={setViewportStats}
        viewport={viewport}
      />
      {rendererType === RendererType.JavaScript && (
        <ColorPalette onLUTComponentsUpdate={setLUTComponents} />
      )}
      <AnnotationsElement
        annotations={annotations}
        availableViewTypes={getAvailableViewTypes(
          viewport.dataset,
          rendererType
        )}
        onRendererTypeSwitch={setRendererType}
        onViewTypeSwitch={switchViewType}
      />
    </>
  );
};

interface Props {
  dataset: Dataset;
  onError(message: string): void;
}
