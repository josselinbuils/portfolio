import React, { useEffect, useState } from 'react';
import { Spinner } from '~/platform/components';
import { Window, WindowComponent } from '~/platform/components/Window';
import { cancelable } from '~/platform/utils';
import { SelectDataset, SelectRenderer } from './components';
import { RendererType } from './constants';
import styles from './DICOMViewer.module.scss';
import { DICOMViewerDescriptor } from './DICOMViewerDescriptor';
import { DatasetDescriptor } from './interfaces';
import { getDatasets } from './utils';

const DICOMViewer: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [dataset, setDataset] = useState<DatasetDescriptor>();
  const [datasets, setDatasets] = useState<DatasetDescriptor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rendererType, setRendererType] = useState<RendererType>();

  useEffect(() => {
    const [datasetsPromise, cancelDatasetsPromise] = cancelable(getDatasets());
    datasetsPromise.then(setDatasets).then(() => setLoading(false));
    return cancelDatasetsPromise;
  }, []);

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
        {!dataset && (
          <SelectDataset datasets={datasets} onDatasetSelected={setDataset} />
        )}
        {dataset && !rendererType && (
          <SelectRenderer onRendererTypeSelected={setRendererType} />
        )}
        {loading && <Spinner color="white" />}
      </div>
    </Window>
  );
};

DICOMViewer.appDescriptor = DICOMViewerDescriptor;

export default DICOMViewer;
