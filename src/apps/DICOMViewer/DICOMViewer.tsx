import {
  type JSX,
  Suspense,
  useCallback,
  useLayoutEffect,
  useState,
} from 'preact/compat';
import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { MouseButton } from '@/platform/constants';
import { lazy } from '@/platform/utils/lazy';
import styles from './DICOMViewer.module.scss';
import { AnnotationsElement } from './components/AnnotationsElement/AnnotationsElement';
import { LeftToolbar } from './components/LeftToolbar/LeftToolbar';
import { SelectDataset } from './components/SelectDataset/SelectDataset';
import { ViewportElement } from './components/ViewportElement/ViewportElement';
import { MouseTool, RendererType, ViewType } from './constants';
import { type Annotations } from './interfaces/Annotations';
import { type LUTComponent } from './interfaces/LUTComponent';
import { type ViewportStats } from './interfaces/ViewportStats';
import { type Dataset } from './models/Dataset';
import { Viewport } from './models/Viewport';
import { getAvailableViewTypes } from './utils/getAvailableViewTypes';
import { startTool } from './utils/startTool';

const ColorPalette = lazy(
  async () =>
    (await import('./components/ColorPalette/ColorPalette')).ColorPalette,
);

const DEFAULT_RENDERER_TYPE = RendererType.WebGPU;

const DICOMViewer: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [activeLeftTool, setActiveLeftTool] = useState<MouseTool>(
    MouseTool.Paging,
  );
  const [activeRightTool, setActiveRightTool] = useState<MouseTool>(
    MouseTool.Zoom,
  );
  const [annotations, setAnnotations] = useState<Annotations>({});
  const [dataset, setDataset] = useState<Dataset>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [rendererType, setRendererType] = useState<RendererType>(
    DEFAULT_RENDERER_TYPE,
  );
  const [viewport, setViewport] = useState<Viewport>();
  const [viewportStats, setViewportStats] = useState<ViewportStats>();

  useLayoutEffect(() => {
    if (dataset !== undefined) {
      try {
        setViewport((previousViewport) => {
          if (
            previousViewport === undefined ||
            previousViewport.dataset !== dataset
          ) {
            const availableViewTypes = getAvailableViewTypes(
              dataset,
              rendererType,
            );
            const viewType = availableViewTypes.includes(ViewType.VolumeSkin)
              ? ViewType.VolumeSkin
              : ViewType.Native;

            return Viewport.create(dataset, viewType, rendererType);
          }
          // Keeps the camera when only the renderer type changes
          return previousViewport.clone({ rendererType });
        });
        setAnnotations({ datasetName: dataset.name, rendererType });
      } catch (error) {
        setErrorMessage('Unable to create viewport');
        console.error(error);
      }
    }
  }, [dataset, rendererType]);

  useLayoutEffect(() => {
    if (viewport === undefined) {
      return;
    }

    const { viewType, windowCenter, windowWidth } = viewport;
    const zoom = viewport.getImageZoom();

    if ([ViewType.VolumeBones, ViewType.VolumeSkin].includes(viewType)) {
      setActiveLeftTool(MouseTool.Rotate);
    } else if (viewport.dataset.frames.length > 1) {
      setActiveLeftTool(MouseTool.Paging);
    } else {
      setActiveLeftTool(MouseTool.Windowing);
    }
    setActiveRightTool(MouseTool.Zoom);

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
    [viewportStats],
  );

  useLayoutEffect(() => {
    setErrorMessage(undefined);
  }, [dataset, viewport, rendererType]);

  const handleViewportResize = useCallback(() => {
    if (viewport !== undefined) {
      setAnnotations((previousAnnotations) => ({
        ...previousAnnotations,
        zoom: viewport.getImageZoom(),
      }));
    }
  }, [viewport]);

  const setLutComponents = useCallback(
    (lutComponents: LUTComponent[] | undefined) => {
      if (viewport !== undefined) {
        viewport.lutComponents = lutComponents;
      }
    },
    [viewport],
  );

  function back(): void {
    if (dataset) {
      dataset.destroy();
      setAnnotations({});
      setDataset(undefined);
      setRendererType(DEFAULT_RENDERER_TYPE);
      setViewport(undefined);
      setViewportStats(undefined);
    }
  }

  function render(): JSX.Element | null {
    if (!dataset) {
      return (
        <SelectDataset
          onDatasetSelected={setDataset}
          onError={setErrorMessage}
        />
      );
    }
    if (viewport) {
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
            onError={setErrorMessage}
            onResize={handleViewportResize}
            onStatsUpdate={setViewportStats}
            viewport={viewport}
          />
          {[RendererType.JavaScript, RendererType.WebGPU].includes(
            rendererType,
          ) && (
            <Suspense fallback={null}>
              <ColorPalette onLUTComponentsUpdate={setLutComponents} />
            </Suspense>
          )}
          <AnnotationsElement
            annotations={annotations}
            availableViewTypes={getAvailableViewTypes(
              viewport.dataset,
              rendererType,
            )}
            onRendererTypeSwitch={setRendererType}
            onViewTypeSwitch={switchViewType}
          />
        </>
      );
    }
    return null;
  }

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

  async function startActiveTool(downEvent: MouseEvent): Promise<void> {
    if (viewport !== undefined) {
      viewport.draft = true;
    }
    await startTool(
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
            if (
              ![
                ViewType.Oblique,
                ViewType.VolumeBones,
                ViewType.VolumeSkin,
              ].includes(viewport.viewType)
            ) {
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

          case MouseTool.Windowing: {
            const { windowCenter, windowWidth } = additionalArgs[0];

            setAnnotations((previousAnnotations) => ({
              ...previousAnnotations,
              windowCenter,
              windowWidth,
            }));
            break;
          }

          case MouseTool.Zoom: {
            const { zoom } = additionalArgs[0];

            setAnnotations((previousAnnotations) => ({
              ...previousAnnotations,
              zoom,
            }));
            break;
          }

          default:
            throw new Error('Unknown mouse tool');
        }
      },
      () => {
        if (viewport !== undefined) {
          viewport.draft = false;
        }
      },
    );
  }

  function switchViewType(viewType: ViewType): void {
    if (dataset === undefined) {
      throw new Error('Dataset undefined');
    }
    if (rendererType === undefined) {
      throw new Error('Renderer type undefined');
    }
    setViewport(Viewport.create(dataset, viewType, rendererType));
  }

  return (
    <Window
      className={styles.dicomViewerWindow}
      minHeight={534}
      minWidth={880}
      ref={windowRef}
      title="DICOMViewer"
      titleClassName={styles.dicomViewerTitleBar}
      {...injectedWindowProps}
    >
      <div className={styles.dicomViewer}>
        {dataset && (
          <button className={styles.button} onClick={back} type="button">
            Back
          </button>
        )}
        {render()}
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      </div>
    </Window>
  );
};

export default DICOMViewer;
