import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Spinner } from '~/platform/components';
import { Window, WindowComponent } from '~/platform/components/Window';
import { cancelable } from '~/platform/utils';
import { SelectDataset, SelectRenderer } from './components';
import { RendererType } from './constants';
import styles from './DICOMViewer.module.scss';
import { DICOMViewerDescriptor } from './DICOMViewerDescriptor';
import { DatasetDescriptor } from './interfaces';
import { DicomFrame } from './models';
import { getDatasets, loadFrames } from './utils';

const DICOMViewer: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [dataset, setDataset] = useState<DatasetDescriptor>();
  const [datasets, setDatasets] = useState<DatasetDescriptor[]>([]);
  const [frames, setFrames] = useState<DicomFrame[]>([]);
  const [loading, setLoading] = useState(true);
  const [rendererType, setRendererType] = useState<RendererType>();

  useEffect(() => {
    const [datasetsPromise, cancelDatasetsPromise] = cancelable(getDatasets());
    datasetsPromise.then(setDatasets).then(() => setLoading(false));
    return cancelDatasetsPromise;
  }, []);

  useLayoutEffect(() => {
    if (dataset === undefined) {
      return;
    }
    setLoading(true);

    const [framesPromise, cancelFramesPromise] = cancelable(
      loadFrames(dataset)
    );
    framesPromise.then(setFrames).then(() => setLoading(false));

    return cancelFramesPromise;
  }, [dataset]);

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
                onDatasetSelected={setDataset}
              />
            )}
            {dataset && !rendererType && (
              <SelectRenderer onRendererTypeSelected={setRendererType} />
            )}
            {dataset && rendererType && frames.length}
          </>
        )}
      </div>
    </Window>
  );
};

DICOMViewer.appDescriptor = DICOMViewerDescriptor;

export default DICOMViewer;
