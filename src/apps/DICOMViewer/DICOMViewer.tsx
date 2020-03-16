import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Toolbox } from '~/apps/DICOMViewer/Toolbox';
import { Spinner } from '~/platform/components';
import { Window, WindowComponent } from '~/platform/components/Window';
import { MouseButton } from '~/platform/constants';
import { cancelable } from '~/platform/utils';
import { SelectDataset, SelectRenderer } from './components';
import { MouseTool, RendererType } from './constants';
import styles from './DICOMViewer.module.scss';
import { DICOMViewerDescriptor } from './DICOMViewerDescriptor';
import { DatasetDescriptor } from './interfaces';
import { Dataset, Viewport } from './models';
import { loadDatasetList, loadFrames } from './utils';

const DICOMViewer: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [dataset, setDataset] = useState<Dataset>();
  const [datasetDescriptor, setDatasetDescriptor] = useState<
    DatasetDescriptor
  >();
  const [datasets, setDatasets] = useState<DatasetDescriptor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rendererType, setRendererType] = useState<RendererType>();
  const [toolbox, setToolbox] = useState<Toolbox>();
  const [viewport, setViewport] = useState<Viewport>();
  const viewportElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const [datasetsPromise, cancelDatasetsPromise] = cancelable(
      loadDatasetList()
    );
    datasetsPromise.then(setDatasets).then(() => setLoading(false));
    return cancelDatasetsPromise;
  }, []);

  useEffect(() => {
    if (dataset !== undefined && rendererType !== undefined) {
      const newViewport = Viewport.create(dataset, rendererType);
      setViewport(newViewport);
      return () => newViewport.destroy();
    }
  }, [dataset, rendererType]);

  useEffect(() => {
    if (viewport === undefined) {
      return;
    }
    const newToolbox = new Toolbox(viewport, viewportElementRef);

    newToolbox.selectActiveTool({
      button: MouseButton.Left,
      tool:
        viewport.dataset.frames.length > 1
          ? MouseTool.Paging
          : MouseTool.Windowing
    });
    setToolbox(newToolbox);
  }, [viewport]);

  useLayoutEffect(() => {
    if (datasetDescriptor === undefined) {
      return;
    }
    setLoading(true);

    const [framesPromise, cancelFramesPromise] = cancelable(
      loadFrames(datasetDescriptor)
    );
    framesPromise.then(dicomFrames => {
      setLoading(false);
      setDataset(Dataset.create(datasetDescriptor.name, dicomFrames));
    });

    return cancelFramesPromise;
  }, [datasetDescriptor]);

  return (
    <Window
      {...injectedWindowProps}
      background="black"
      titleColor="#efefef"
      minWidth={880}
      minHeight={500}
      ref={windowRef}
      title={DICOMViewerDescriptor.appName}
    >
      <div className={styles.dicomViewer}>
        {loading ? (
          <Spinner color="white" />
        ) : (
          <>
            {!dataset && (
              <SelectDataset
                datasets={datasets}
                onDatasetSelected={setDatasetDescriptor}
              />
            )}
            {dataset && !rendererType && (
              <SelectRenderer onRendererTypeSelected={setRendererType} />
            )}
          </>
        )}
      </div>
    </Window>
  );
};

DICOMViewer.appDescriptor = DICOMViewerDescriptor;

export default DICOMViewer;
