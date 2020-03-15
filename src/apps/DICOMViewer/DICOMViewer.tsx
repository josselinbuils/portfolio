import React, { useEffect, useState } from 'react';
import { Spinner } from '~/platform/components';
import { Window, WindowComponent } from '~/platform/components/Window';
import { cancelable } from '~/platform/utils';
import { SelectDataset } from './components';
import styles from './DICOMViewer.module.scss';
import { DICOMViewerDescriptor } from './DICOMViewerDescriptor';
import { DatasetDescriptor } from './interfaces';
import { getDatasets } from './utils';

const DICOMViewer: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [datasets, setDatasets] = useState<DatasetDescriptor[]>([]);
  const [dataset, setDataset] = useState<DatasetDescriptor>();
  const [loading, setLoading] = useState(true);

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
        <SelectDataset datasets={datasets} onDatasetSelected={setDataset} />
        {loading && <Spinner color="white" />}
      </div>
    </Window>
  );
};

DICOMViewer.appDescriptor = DICOMViewerDescriptor;

export default DICOMViewer;
