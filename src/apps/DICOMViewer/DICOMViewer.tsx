import React, {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { Spinner } from '~/platform/components';
import { Window, WindowComponent } from '~/platform/components/Window';
import { MouseButton } from '~/platform/constants';
import { cancelable } from '~/platform/utils';
import {
  AnnotationsElement,
  ProgressRing,
  SelectDataset,
  SelectRenderer,
  Toolbar,
  ViewportElement
} from './components';
import { MouseTool, RendererType, ViewType } from './constants';
import styles from './DICOMViewer.module.scss';
import { DICOMViewerDescriptor } from './DICOMViewerDescriptor';
import { Annotations, DatasetDescriptor } from './interfaces';
import { Dataset, Viewport } from './models';
import {
  getAvailableViewTypes,
  loadDatasetList,
  loadFrames,
  startTool
} from './utils';

const WAIT_FOR_FULL_PROGRESS_RING_DELAY_MS = 500;

const DICOMViewer: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [activeLeftTool, setActiveLeftTool] = useState<MouseTool>(
    MouseTool.Paging
  );
  const [activeRightTool, setActiveRightTool] = useState<MouseTool>(
    MouseTool.Zoom
  );
  const [dataset, setDataset] = useState<Dataset>();
  const [datasetDescriptor, setDatasetDescriptor] = useState<
    DatasetDescriptor
  >();
  const [annotations, setAnnotations] = useState<Annotations>({});
  const [datasets, setDatasets] = useState<DatasetDescriptor[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [rendererType, setRendererType] = useState<RendererType>();
  const [viewport, setViewport] = useState<Viewport>();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const viewportElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const [datasetsPromise, cancelDatasetsPromise] = cancelable(
      loadDatasetList()
    );
    datasetsPromise
      .then(setDatasets)
      .catch(error => {
        setErrorMessage('Unable to retrieve datasets');
        console.error(error);
      })
      .finally(() => setLoading(false));
    return cancelDatasetsPromise;
  }, []);

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
        setErrorMessage('Unable to create viewport');
        console.error(error);
      }
    }
  }, [dataset, rendererType]);

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

  useLayoutEffect(() => {
    if (datasetDescriptor === undefined) {
      return;
    }
    setLoading(true);
    setLoadingProgress(0);

    const [framesPromise, cancelFramesPromise] = cancelable(
      loadFrames(datasetDescriptor, setLoadingProgress)
    );
    framesPromise
      .then(dicomFrames => {
        // Be sure that 100% will be display on the progress ring
        setTimeout(() => {
          setDataset(Dataset.create(datasetDescriptor.name, dicomFrames));
          setLoading(false);
        }, WAIT_FOR_FULL_PROGRESS_RING_DELAY_MS);
      })
      .catch(error => {
        setLoading(false);
        setErrorMessage('Unable to retrieve frames');
        console.error(error);
      });

    return cancelFramesPromise;
  }, [datasetDescriptor]);

  function back(): void {
    setErrorMessage(undefined);

    if (rendererType) {
      setAnnotations({});
      setViewport(undefined);
      setActiveLeftTool(MouseTool.Paging);
      setActiveRightTool(MouseTool.Zoom);
      setRendererType(undefined);
    } else if (dataset) {
      dataset.destroy();
      setDataset(undefined);
      setDatasetDescriptor(undefined);
    }
  }

  const handleError = useCallback((message: string): void => {
    setErrorMessage(message);
    setLoading(false);
  }, []);

  function render(): ReactElement | null {
    if (loading) {
      return datasetDescriptor && !dataset ? (
        <ProgressRing
          className={styles.progressRing}
          color="white"
          progress={loadingProgress}
          radius={50}
          thickness={4}
        />
      ) : (
        <Spinner color="white" />
      );
    }
    if (!dataset) {
      return (
        <SelectDataset
          datasets={datasets}
          onDatasetSelected={setDatasetDescriptor}
        />
      );
    }
    if (!rendererType) {
      return <SelectRenderer onRendererTypeSelected={setRendererType} />;
    }
    if (viewport) {
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
            onError={handleError}
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

  return (
    <Window
      {...injectedWindowProps}
      background="black"
      titleColor="#efefef"
      minWidth={880}
      minHeight={554}
      onResize={({ height, width }) => {
        setViewportHeight(height - 42);
        setViewportWidth(width);
      }}
      ref={windowRef}
      title={DICOMViewerDescriptor.appName}
    >
      <div className={styles.dicomViewer}>
        {dataset && (
          <button className={styles.button} onClick={back}>
            Back
          </button>
        )}
        {render()}
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      </div>
    </Window>
  );
};

DICOMViewer.appDescriptor = DICOMViewerDescriptor;

export default DICOMViewer;
